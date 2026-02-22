// Session-aware localStorage utility for user-specific data persistence

export interface UserStorageOptions {
    prefix?: string;
    fallbackUserId?: string;
}

/**
 * Session-aware storage utility that namespaces data by user ID
 * Falls back to 'guest' if no user is logged in
 */
class UserStorage {
    private prefix: string;
    private fallbackUserId: string;

    constructor(options: UserStorageOptions = {}) {
        this.prefix = options.prefix || 'padhega';
        this.fallbackUserId = options.fallbackUserId || 'guest';
    }

    /**
     * Get the current user ID from session/auth context
     * This should be called dynamically to get the latest user
     */
    private getUserId(): string {
        // Try to get user from session storage (set by AuthContext)
        const sessionUser = sessionStorage.getItem('currentUserId');
        if (sessionUser) return sessionUser;

        // Try to get user from localStorage (backup)
        const localUser = localStorage.getItem(`${this.prefix}_currentUser`);
        if (localUser) {
            try {
                const parsed = JSON.parse(localUser);
                return parsed.email || parsed.id || this.fallbackUserId;
            } catch {
                return this.fallbackUserId;
            }
        }

        return this.fallbackUserId;
    }

    /**
     * Generate storage key with user namespace
     */
    private getKey(key: string): string {
        const userId = this.getUserId();
        return `${this.prefix}_${userId}_${key}`;
    }

    /**
     * Get data from storage
     */
    get<T>(key: string, defaultValue: T): T {
        try {
            const storageKey = this.getKey(key);
            const item = localStorage.getItem(storageKey);

            if (item === null) return defaultValue;

            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Set data in storage
     */
    set<T>(key: string, value: T): void {
        try {
            const storageKey = this.getKey(key);
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
        }
    }

    /**
     * Remove data from storage
     */
    remove(key: string): void {
        try {
            const storageKey = this.getKey(key);
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error(`Error removing from storage (${key}):`, error);
        }
    }

    /**
     * Clear all data for current user
     */
    clearUserData(): void {
        try {
            const userId = this.getUserId();
            const prefix = `${this.prefix}_${userId}_`;

            // Find and remove all keys for this user
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    }

    /**
     * Set the current user ID (called by AuthContext on login)
     */
    setCurrentUser(userId: string | null): void {
        if (userId) {
            sessionStorage.setItem('currentUserId', userId);
        } else {
            sessionStorage.removeItem('currentUserId');
        }
    }
}

// Export singleton instance
export const userStorage = new UserStorage();

// Helper functions for common operations
export const getUserData = <T>(key: string, defaultValue: T): T => {
    return userStorage.get(key, defaultValue);
};

export const setUserData = <T>(key: string, value: T): void => {
    userStorage.set(key, value);
};

export const removeUserData = (key: string): void => {
    userStorage.remove(key);
};

export const clearAllUserData = (): void => {
    userStorage.clearUserData();
};

export const setCurrentUser = (userId: string | null): void => {
    userStorage.setCurrentUser(userId);
};
