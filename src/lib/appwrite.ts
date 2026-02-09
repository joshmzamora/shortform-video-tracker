import { Client, Databases, ID, Query, Permission, Role, AppwriteException } from 'node-appwrite';

// Environment Variables
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

// Schema Constants
const DB_ID = 'tracker_db';
const TABLE_CONSENTS = 'consents';
const TABLE_QUESTIONNAIRES = 'questionnaires';
const TABLE_SESSIONS = 'sessions';

// Fallback Memory Store (if Appwrite is not configured)
const globalStore = global as any;
if (!globalStore.__appwriteFallback) {
    globalStore.__appwriteFallback = {
        [TABLE_CONSENTS]: [],
        [TABLE_QUESTIONNAIRES]: [],
        [TABLE_SESSIONS]: []
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

    // Initialize Database and Tables if they don't exist
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

            // Check/Create Tables (Collections)
            await this.ensureTable(TABLE_CONSENTS, [
                { key: 'participantId', type: 'string', size: 255, required: true },
                { key: 'participantName', type: 'string', size: 255, required: true },
                { key: 'agreed', type: 'boolean', required: true },
                { key: 'parentalConsentAgreed', type: 'boolean', required: true },
                { key: 'timestamp', type: 'string', size: 64, required: true }
            ]);

            await this.ensureTable(TABLE_QUESTIONNAIRES, [
                { key: 'participantId', type: 'string', size: 255, required: true },
                { key: 'answers', type: 'string', size: 10000, required: true }, // JSON string
                { key: 'timestamp', type: 'string', size: 64, required: true }
            ]);

            await this.ensureTable(TABLE_SESSIONS, [
                { key: 'participantId', type: 'string', size: 255, required: true },
                { key: 'type', type: 'string', size: 64, required: false },
                { key: 'videoId', type: 'string', size: 255, required: false },
                { key: 'interactionType', type: 'string', size: 64, required: false },
                { key: 'watchTimeMs', type: 'integer', required: false },
                { key: 'genre', type: 'string', size: 64, required: false },
                { key: 'timestamp', type: 'string', size: 64, required: true },
                { key: 'events', type: 'string', size: 1000000, required: false } // Large JSON for backups
            ]);

        } catch (error) {
            console.error("[Appwrite] Schema initialization failed:", error);
        }
    }

    private async ensureTable(tableId: string, attributes: any[]) {
        if (!this.databases) return;
        try {
            await this.databases.getCollection(DB_ID, tableId);
            // Collection exists, we should assume attributes exist or check them?
            // For now, we assume if collection exists, it's fine.
            // But we could list attributes and add missing ones.
            // Let's keep it simple: Create if missing.
        } catch (e: any) {
            if (e.code === 404) {
                console.log(`[Appwrite] Creating Table: ${tableId}`);
                await this.databases.createCollection(DB_ID, tableId, tableId);
                
                // Create Attributes
                for (const attr of attributes) {
                    try {
                        if (attr.type === 'string') {
                            await this.databases.createStringAttribute(DB_ID, tableId, attr.key, attr.size || 255, attr.required);
                        } else if (attr.type === 'boolean') {
                            await this.databases.createBooleanAttribute(DB_ID, tableId, attr.key, attr.required);
                        } else if (attr.type === 'integer') {
                            await this.databases.createIntegerAttribute(DB_ID, tableId, attr.key, attr.required);
                        }
                        // Add delays to avoid rate limits or race conditions?
                        // Appwrite handles this queue usually, but slight delay helps.
                        await new Promise(r => setTimeout(r, 200));
                    } catch (err) {
                        console.error(`[Appwrite] Failed to create attribute ${attr.key} on ${tableId}:`, err);
                    }
                }
            }
        }
    }

    // Generic Save
    async saveDocument(tableId: string, data: any) {
        if (!this.isReady || !this.databases) {
            // Fallback
            memoryStore[tableId].push(data);
            return true;
        }

        try {
            // Sanitize data: remove undefined fields, stringify JSON fields if needed
            const documentData = { ...data };
            
            // Handle JSON fields
            if (tableId === TABLE_QUESTIONNAIRES && typeof documentData.answers === 'object') {
                documentData.answers = JSON.stringify(documentData.answers);
            }
            if (tableId === TABLE_SESSIONS && typeof documentData.events === 'object') {
                documentData.events = JSON.stringify(documentData.events);
            }

            // Remove undefined or null fields if they are optional and not provided?
            // Appwrite createDocument ignores fields not in schema? No, it errors.
            // We should only pass fields that are in the schema.
            // But we can't easily validate against schema here without fetching it.
            // We rely on the caller passing correct data.
            
            // Also, remove keys that might be problematic (like internal ones, though 'id' is used for ID)
            const docId = documentData.id ? documentData.id : ID.unique();
            if (documentData.id) delete documentData.id; // Remove ID from body if it's there

            await this.databases.createDocument(
                DB_ID,
                tableId,
                docId,
                documentData
            );
            return true;
        } catch (error) {
            console.error(`[Appwrite] Failed to save to ${tableId}:`, error);
            // Fallback on failure
            memoryStore[tableId].push(data);
            return false;
        }
    }

    // Generic List
    async listDocuments(tableId: string) {
        let memoryData = memoryStore[tableId] || [];

        if (!this.isReady || !this.databases) {
            return memoryData;
        }

        try {
            const response = await this.databases.listDocuments(
                DB_ID,
                tableId,
                [Query.limit(1000), Query.orderDesc('$createdAt')]
            );
            
            // Map back to usable data
            const dbData = response.documents.map(doc => {
                const data = { ...doc };
                // Parse JSON fields
                if (tableId === TABLE_QUESTIONNAIRES && data.answers) {
                    try { data.answers = JSON.parse(data.answers); } catch {}
                }
                if (tableId === TABLE_SESSIONS && data.events) {
                    try { data.events = JSON.parse(data.events); } catch {}
                }
                return data;
            });

            return [...memoryData, ...dbData];

        } catch (error) {
            console.error(`[Appwrite] Failed to list ${tableId}:`, error);
            return memoryData;
        }
    }
}

export const appwriteService = new AppwriteService();

export const Tables = {
    Consents: TABLE_CONSENTS,
    Questionnaires: TABLE_QUESTIONNAIRES,
    Sessions: TABLE_SESSIONS
};
