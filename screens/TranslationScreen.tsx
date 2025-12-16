import React, { useState } from 'react';
import { TopAppBar } from '../components/Layouts';
import { translateText } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { LoadingState } from '../types';

const TranslationScreen: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    const [targetLang, setTargetLang] = useState<'TR' | 'EN'>('TR');

    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        setLoadingState(LoadingState.LOADING);
        try {
            const result = await translateText(inputText, targetLang);
            setOutputText(result);
            setLoadingState(LoadingState.SUCCESS);
            
            // Save to history with full result to resume editing
            addToHistory({
                type: 'TRANSLATE',
                title: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
                preview: result.substring(0, 50),
                fullContent: result // Save the translated text
            });
        } catch (error) {
            setLoadingState(LoadingState.ERROR);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText);
    };

    const toggleLang = () => {
        setTargetLang(prev => prev === 'TR' ? 'EN' : 'TR');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <TopAppBar title="Akademik Çeviri" showBack={true} showSettings={true} />
            
            <main className="flex-1 flex flex-col overflow-y-auto w-full max-w-md mx-auto pb-6">
                {/* Language Selectors */}
                <div className="px-4 py-4 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
                    <button className="flex-1 flex h-10 items-center justify-between gap-x-2 rounded-xl bg-white dark:bg-[#1e232e] px-3 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-transform">
                        <span className="text-sm font-medium truncate">{targetLang === 'TR' ? 'İngilizce' : 'Türkçe'}</span>
                        <span className="material-symbols-outlined text-[20px] text-gray-400">arrow_drop_down</span>
                    </button>
                    <button onClick={toggleLang} className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:rotate-180 transition-transform duration-300">
                        <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                    </button>
                    <button className="flex-1 flex h-10 items-center justify-between gap-x-2 rounded-xl bg-primary/10 border border-primary/30 px-3 active:scale-95 transition-transform">
                        <span className="text-sm font-bold text-primary truncate">Akademik {targetLang === 'TR' ? 'Türkçe' : 'English'}</span>
                        <span className="material-symbols-outlined text-[20px] text-primary">arrow_drop_down</span>
                    </button>
                </div>

                {/* Input Section */}
                <div className="px-4 space-y-4">
                    <div className="bg-white dark:bg-[#1e232e] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800/50">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kaynak Metin</span>
                            <div className="flex gap-1">
                                <button onClick={() => setInputText('')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors" title="Temizle">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full h-40 bg-transparent border-none p-4 text-base leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-0 resize-none text-slate-800 dark:text-slate-100" 
                            placeholder="Çevrilecek metni buraya yapıştırın..."
                        ></textarea>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-[#1a1f29] flex justify-between items-center text-xs text-gray-400">
                            <span>{inputText.length} / 5000 karakter</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleTranslate}
                        disabled={loadingState === LoadingState.LOADING || !inputText.trim()}
                        className="w-full flex items-center justify-center gap-2 h-14 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingState === LoadingState.LOADING ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[24px]">translate</span>
                        )}
                        <span>{loadingState === LoadingState.LOADING ? 'Çevriliyor...' : 'Çeviriyi Başlat'}</span>
                    </button>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-6 mx-4"></div>

                {/* Output Section */}
                {(outputText || loadingState === LoadingState.SUCCESS) && (
                    <div className="px-4 pb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold leading-tight">Çeviri Sonucu</h3>
                            <div className="flex gap-2">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20">Akademik Dil</span>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-[#1e232e] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 min-h-[160px] relative">
                            <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                                {outputText}
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    Kopyala
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">share</span>
                                    Paylaş
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TranslationScreen;