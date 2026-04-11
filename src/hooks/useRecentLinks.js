import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'shorty-recent-links';
const MAX_HISTORY_LEN = 5;

export function useRecentLinks() {
    // Безопасная инициализация
    const [recentLinks, setRecentLinks] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch {
            // Если localStorage сломан (например квота или битый JSON) — игнорим
        }
        return [];
    });

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
