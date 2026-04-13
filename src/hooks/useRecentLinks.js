import { useState, useEffect, useCallback } from 'react';

export const RECENT_LINKS_STORAGE_KEY = 'shorty-recent-links';
const STORAGE_KEY = RECENT_LINKS_STORAGE_KEY;
const MAX_HISTORY_LEN = 5;

/** Same-tab sync when storage is updated outside the hook (e.g. profile delete). */
export const RECENT_LINKS_CHANGED_EVENT = 'shorty-recent-links-changed';

function readRecentLinksFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Removes entries whose stored short URL path ends with this slug (host may differ).
 * @param {string} slug
 */
export function removeRecentLinkBySlug(slug) {
    if (!slug || typeof slug !== 'string') return;
    try {
        const parsed = readRecentLinksFromStorage();
        if (parsed.length === 0) return;
        const next = parsed.filter((entry) => {
            const su = entry?.shortUrl;
            if (typeof su !== 'string') return true;
            const lastSeg = su.includes('/') ? su.slice(su.lastIndexOf('/') + 1) : su;
            return lastSeg !== slug;
        });
        if (next.length === parsed.length) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(RECENT_LINKS_CHANGED_EVENT));
    } catch {
        // ignore
    }
}

export function useRecentLinks() {
    // Безопасная инициализация
    const [recentLinks, setRecentLinks] = useState(() => readRecentLinksFromStorage());

    // Синхронизация между вкладками браузера
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) {
                        setRecentLinks(parsed);
                    } else {
                        setRecentLinks([]);
                    }
                } catch {
                    setRecentLinks([]);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const onSameTabSync = () => setRecentLinks(readRecentLinksFromStorage());
        window.addEventListener(RECENT_LINKS_CHANGED_EVENT, onSameTabSync);
        return () => window.removeEventListener(RECENT_LINKS_CHANGED_EVENT, onSameTabSync);
    }, []);

    // Сохранение при каждом изменении локального стейта
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentLinks));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }, [recentLinks]);

    const addLink = useCallback((linkData) => {
        setRecentLinks(prev => {
            const filtered = prev.filter(l => l.shortUrl !== linkData.shortUrl);
            const updated = [linkData, ...filtered];
            return updated.slice(0, MAX_HISTORY_LEN);
        });
    }, []);

    const clearHistory = useCallback(() => {
        setRecentLinks([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore storage errors in cleanup path
        }
    }, []);

    return { recentLinks, addLink, clearHistory };
}
