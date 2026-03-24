import { getOfflineQueue, removeFromQueue } from './offlineDB';

/**
 * Utility to sync offline actions with the backend when online.
 * Refactored to avoid circular dependency with axios.js
 */

let isSyncing = false;
let syncListeners = [];

const broadcastSyncStatus = async () => {
    const queue = await getOfflineQueue();
    syncListeners.forEach(l => l({
        itemCount: queue.length,
        isSyncing
    }));
};

export const syncOfflineData = async (apiInstance) => {
    if (isSyncing || !apiInstance) return;
    
    const queue = await getOfflineQueue();
    if (!queue || queue.length === 0) {
        broadcastSyncStatus();
        return;
    }

    console.log(`[OfflineSync] Attempting to sync ${queue.length} actions...`);
    isSyncing = true;
    broadcastSyncStatus();

    for (const action of queue) {
        try {
            // Replay the action using the passed API instance
            await apiInstance({
                method: action.method,
                url: action.url,
                data: action.data,
            });
            // If successful, remove from queue
            await removeFromQueue(action.id);
            console.log(`[OfflineSync] Synced action: ${action.method} ${action.url}`);
        } catch (err) {
            console.log(`[OfflineSync] Sync failed for ${action.id}:`, err.message);
            // If it's a 4xx error (except 429/408), it might be invalid data, skip it for now
            if (err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 408 && err.response.status !== 429) {
                console.warn(`[OfflineSync] Removing invalid offline action ${action.id}`);
                await removeFromQueue(action.id);
            }
        }
    }

    isSyncing = false;
    broadcastSyncStatus();
};

export const onSyncStatusChange = (fn) => {
    syncListeners.push(fn);
    broadcastSyncStatus();
    return () => { syncListeners = syncListeners.filter(l => l !== fn); };
};

// Background task registration
export const startSyncInterval = (apiInstance, intervalMs = 30000) => {
    setInterval(() => syncOfflineData(apiInstance), intervalMs);
};
