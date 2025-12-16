import React, { useState } from 'react';
import { TopAppBar } from '../components/Layouts';
import { summarizeText } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { LoadingState, SummaryTone } from '../types';

const SummaryScreen: React.FC = () => {
    const [sliderValue, setSliderValue] = useState(350);
    const [tone, setTone] = useState<SummaryTone>(SummaryTone.DESCRIPTIVE);
    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    const [inputMode, setInputMode] = useState<'FILE' | 'TEXT'>('TEXT'); 

    const handleSummarize = async () => {
        if (!inputText.trim()) return;

        setLoadingState(LoadingState.LOADING);
        try {
            const result = await summarizeText(inputText, tone, sliderValue);
            setSummary(result);
            setLoadingState(LoadingState.SUCCESS);

            // Save to history
            addToHistory({
                type: 'SUMMARIZE',
                title: 'Özet: ' + inputText.substring(0, 20) + '...',
                preview: result.substring(0, 50),
            });
        } catch (error) {
            setLoadingState(LoadingState.ERROR);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                if (text) {
                    setInputText(text);
                    setInputMode('TEXT'); // Switch to text view to show content
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <TopAppBar title="Literatür Özetleme" showBack={true} />
            
            <main className="flex-1 flex flex-col w-full max-w-md mx-auto p-4 pb-24">
                {/* Step 1: Input Source */}
                <section className="mb-6">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h2 className="text-xl font-bold">Veri Kaynağı</h2>
                        <div className="flex gap-2 text-xs">
                            <button 
                                onClick={() => setInputMode('TEXT')}
                                className={`px-3 py-1 rounded-full border ${inputMode === 'TEXT' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-500 border-gray-300'}`}
                            >
                                Metin
                            </button>
                             <button 
                                onClick={() => setInputMode('FILE')}
                                className={`px-3 py-1 rounded-full border ${inputMode === 'FILE' ? 'bg-primary text-white border-primary' : 'bg-transparent text-gray-500 border-gray-300'}`}
                            >
                                Dosya
                            </button>
                        </div>
                    </div>
                    
                    {inputMode === 'FILE' ? (
                        <div className="group relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-surface-light dark:bg-surface-dark hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer">
                            <div className="flex flex-col items-center gap-3 p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Dosyayı buraya sürükle</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">veya seçmek için dokun</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                    TXT, MD, JSON
                                </span>
                            </div>
                            <input 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                type="file"
                                accept=".txt,.md,.json,.csv"
                                onChange={handleFileUpload}
                            />
                        </div>
                    ) : (
                         <div className="relative group">
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-48 resize-none rounded-xl border border-gray-300 dark:border-[#3b4354] bg-white dark:bg-[#1c2333] p-4 text-base leading-relaxed text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                                placeholder="Özetlenecek metni buraya yapıştırın..." 
                            ></textarea>
                            {inputText.length > 0 && (
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/80 dark:bg-[#1c2333]/80 px-2 rounded">
                                    {inputText.length} karakter
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Step 2: Configuration */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 px-1">Özet Ayarları</h2>
                    <div className="space-y-4">
                        {/* Tone Selector */}
                        <div className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h3 className="font-medium text-sm">Özet Tipi</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="cursor-pointer">
                                    <input 
                                        type="radio" 
                                        className="peer sr-only" 
                                        name="tone" 
                                        checked={tone === SummaryTone.DESCRIPTIVE}
                                        onChange={() => setTone(SummaryTone.DESCRIPTIVE)}
                                    />
                                    <div className="flex items-center justify-center py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all text-sm font-medium">
                                        Betimleyici
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input 
                                        type="radio" 
                                        className="peer sr-only" 
                                        name="tone"
                                        checked={tone === SummaryTone.CRITICAL}
                                        onChange={() => setTone(SummaryTone.CRITICAL)}
                                    />
                                    <div className="flex items-center justify-center py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all text-sm font-medium">
                                        Eleştirel
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Word Count Slider */}
                        <div className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">short_text</span>
                                    <h3 className="font-medium text-sm">Uzunluk Hedefi</h3>
                                </div>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">~{sliderValue} Kelime</span>
                            </div>
                            <input 
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                                max="400" 
                                min="50" 
                                type="range" 
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                                <span>50</span>
                                <span>400</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preview Section */}
                {(summary || loadingState === LoadingState.SUCCESS) && (
                    <section className="mb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-xl font-bold">Sonuç</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => navigator.clipboard.writeText(summary)}
                                    className="p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors" title="Kopyala"
                                >
                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="h-1 w-full bg-gradient-to-r from-primary to-blue-400"></div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold mb-3 leading-snug">Oluşturulan Özet</h3>
                                <div className="space-y-3">
                                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 text-justify whitespace-pre-wrap">
                                        {summary}
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                        AI Generated
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {tone === SummaryTone.DESCRIPTIVE ? 'Betimleyici' : 'Eleştirel'}
                                    </span>
                                    <div className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span> Şimdi
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

                {/* FAB Area */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent pt-8">
                <div className="max-w-md mx-auto">
                    <button 
                        onClick={handleSummarize}
                        disabled={loadingState === LoadingState.LOADING || !inputText.trim()}
                        className="group w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingState === LoadingState.LOADING ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined group-hover:animate-pulse">auto_awesome</span>
                        )}
                        <span>{loadingState === LoadingState.LOADING ? 'Özetleniyor...' : 'Özet Oluştur'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryScreen;