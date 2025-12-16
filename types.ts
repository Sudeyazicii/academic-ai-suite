export enum LoadingState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export interface NavigationItem {
    label: string;
    icon: string;
    path: string;
    isActive?: boolean;
}

export enum SummaryTone {
    DESCRIPTIVE = 'Betimleyici',
    CRITICAL = 'Eleştirel'
}

export interface TranslationResult {
    original: string;
    translated: string;
    language: string;
}

export interface EditResult {
    original: string;
    improved: string;
    changes: string[]; // Simplification for demo
}

export interface HistoryItem {
    id: string;
    type: 'TRANSLATE' | 'SUMMARIZE' | 'EDIT' | 'CHAT';
    title: string;
    preview: string;
    fullContent?: string; // New field to store the complete text
    timestamp: number;
}