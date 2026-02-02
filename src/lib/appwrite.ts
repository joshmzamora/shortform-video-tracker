import { Client, Databases, ID, Query, Permission, Role, AppwriteException } from 'node-appwrite';

// Environment Variables
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

// Schema Constants
const DB_ID = 'tracker_db';
const COLL_CONSENTS = 'consents';
const COLL_QUESTIONNAIRES = 'questionnaires';
const COLL_SESSIONS = 'sessions';

// Fallback Memory Store (if Appwrite is not configured)
const globalStore = global as any;
if (!globalStore.__appwriteFallback) {
    globalStore.__appwriteFallback = {
        [COLL_CONSENTS]: [],
        [COLL_QUESTIONNAIRES]: [],
        [COLL_SESSIONS]: []
    };
}
const memoryStore = globalStore.__appwriteFallback;

class AppwriteService {
    private client: Client | null = null;
    private databases: Databases | null = null;
    private isReady: boolean = false;

    constructor() {
        if (PROJECT_ID && API_KEY) {
            this.client = new Client()
                .setEndpoint(ENDPOINT)
                .setProject(PROJECT_ID)
                .setKey(API_KEY);
            this.databases = new Databases(this.client);
            this.isReady = true;
            this.initSchema(); // Fire and forget initialization
        } else {
            console.warn("[Appwrite] Missing Project ID or API Key. Using in-memory fallback.");
        }
    }

    // Initialize Database and Collections if they don't exist
    private async initSchema() {
        if (!this.databases || !this.isReady) return;

        try {
            // Check/Create Database
            try {
                await this.databases.get(DB_ID);
            } catch (e: any) {
                if (e.code === 404) {
                    console.log("[Appwrite] Creating Database...");
                    await this.databases.create(DB_ID, DB_ID, true);
                }
            }

            // Check/Create Collections
            await this.ensureCollection(COLL_CONSENTS);
            await this.ensureCollection(COLL_QUESTIONNAIRES);
            await this.ensureCollection(COLL_SESSIONS);

        } catch (error) {
            console.error("[Appwrite] Schema initialization failed:", error);
        }
    }

    private async ensureCollection(collId: string) {
        if (!this.databases) return;
        try {
            await this.databases.getCollection(DB_ID, collId);
        } catch (e: any) {
            if (e.code === 404) {
                console.log(`[Appwrite] Creating Collection: ${collId}`);
                await this.databases.createCollection(DB_ID, collId, collId);
                // We could create attributes here if needed, but Appwrite allows schemaless-ish (if permissions allow?)
                // Actually, Appwrite Databases require attributes for structured data, but we can store JSON in a string attribute or define attributes.
                // For simplicity/robustness, we'll try to store the main data as a big string 'data' attribute, 
                // OR we define specific attributes.
                // Let's define a 'payload' string attribute (large) to store the JSON, 
                // and some top-level attributes for querying (participantId, timestamp).

                await this.databases.createStringAttribute(DB_ID, collId, 'participantId', 255, true);
                await this.databases.createStringAttribute(DB_ID, collId, 'payload', 100000, true); // 100kb limit? text attribute can be bigger? 
                // MediumText is 16MB. 'payload' as string size 1,000,000?
                // Appwrite string max is 1,073,741,824 in some versions, but standard string is 255?
                // Wait, createStringAttribute size max is 1073741824.
                // Let's safe bet on 1000000.
                
                // Add timestamp
                // await this.databases.createDatetimeAttribute(DB_ID, collId, 'timestamp', false); 
                // Actually $createdAt exists.
            }
        }
    }

    // Generic Save
    async saveDocument(collectionId: string, data: any) {
        if (!this.isReady || !this.databases) {
            // Fallback
            memoryStore[collectionId].push(data);
            return true;
        }

        try {
            // We store the raw data in 'payload' and extract key fields
            const payload = JSON.stringify(data);
            const participantId = data.participantId || data.id || 'unknown';

            await this.databases.createDocument(
                DB_ID,
                collectionId,
                ID.unique(),
                {
                    participantId,
                    payload
                }
            );
            return true;
        } catch (error) {
            console.error(`[Appwrite] Failed to save to ${collectionId}:`, error);
            // Fallback on failure
            memoryStore[collectionId].push(data);
            return false;
        }
    }

    // Generic List
    async listDocuments(collectionId: string) {
        let memoryData = memoryStore[collectionId] || [];

        if (!this.isReady || !this.databases) {
            return memoryData;
        }

        try {
            const response = await this.databases.listDocuments(
                DB_ID,
                collectionId,
                [Query.limit(1000), Query.orderDesc('$createdAt')]
            );
            
            // Map back to original data structure
            const dbData = response.documents.map(doc => {
                try {
                    const parsed = JSON.parse(doc.payload);
                    // Inject metadata if needed
                    return { ...parsed, $createdAt: doc.$createdAt, $id: doc.$id };
                } catch (e) {
                    return null;
                }
            }).filter(Boolean);

            // Merge with memory data (in case some failed to save to DB but are in memory)
            // Ideally we'd deduplicate, but simple concatenation is safer than missing data.
            return [...memoryData, ...dbData];

        } catch (error) {
            console.error(`[Appwrite] Failed to list ${collectionId}:`, error);
            return memoryData;
        }
    }
}

export const appwriteService = new AppwriteService();

export const Collections = {
    Consents: COLL_CONSENTS,
    Questionnaires: COLL_QUESTIONNAIRES,
    Sessions: COLL_SESSIONS
};
