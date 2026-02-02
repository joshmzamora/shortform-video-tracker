
export const STORAGE_KEYS = {
  CONSENTS: 'shortform_consents',
  QUESTIONNAIRES: 'shortform_questionnaires',
  SESSIONS: 'shortform_sessions',
};

export const ClientStorage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return [];
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      return [];
    }
  },

  save: (key: string, data: any) => {
    if (typeof window === 'undefined') return false;
    try {
      const current = ClientStorage.get(key);
      // If data is an array (like sessions often are), push it? 
      // Actually, for consistency, let's say 'data' is a single record.
      // But we need to handle if 'data' is already an array of items?
      // Based on previous usage:
      // Consent: Object
      // Questionnaire: Object
      // Session: Array of interactions (one session = array)
      
      const updated = [...current, data];
      window.localStorage.setItem(key, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error(`Error saving to ${key} in localStorage`, error);
      return false;
    }
  },

  // Helper to import external data (e.g. from JSON file)
  importData: (key: string, dataArray: any[]) => {
    if (typeof window === 'undefined') return false;
    try {
      const current = ClientStorage.get(key);
      // Merge and deduplicate based on participantId + timestamp?
      // For simplicity, just append. User can clear if needed.
      const updated = [...current, ...dataArray];
      window.localStorage.setItem(key, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error(`Error importing to ${key}`, error);
      return false;
    }
  },

  clear: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }
};
