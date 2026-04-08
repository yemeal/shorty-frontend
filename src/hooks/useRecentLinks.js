import { useState, useEffect } from 'react';

const STORAGE_KEY = 'shorty-recent-links';
const MAX_HISTORY_LEN = 5;

export function useRecentLinks() {
    const [recentLinks, setRecentLinks] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentLinks));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }, [recentLinks]);

    const addLink = (linkData) => {
        setRecentLinks(prev => {
            // Remove duplicates by alias if it exists
            const filtered = prev.filter(l => l.shortUrl !== linkData.shortUrl);
            const updated = [linkData, ...filtered];
            // Enforce MAX limit
            return updated.slice(0, MAX_HISTORY_LEN);
        });
    };

    const clearHistory = () => {
        setRecentLinks([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { recentLinks, addLink, clearHistory };
}
