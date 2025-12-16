import { HistoryItem } from "../types";

const STORAGE_KEY = 'academic_assistant_history';

export const getHistory = (): HistoryItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parse history", e);
        return [];
    }
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
        const currentHistory = getHistory();
        const newItem: HistoryItem = {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        // Keep only last 20 items
        const newHistory = [newItem, ...currentHistory].slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
        console.error("Failed to save history", e);
    }
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};