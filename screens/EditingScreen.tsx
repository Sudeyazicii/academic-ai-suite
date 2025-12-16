import React, { useState } from 'react';
import { TopAppBar } from '../components/Layouts';
import { improveText } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { LoadingState } from '../types';

const EditingScreen: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);

    const handleImprove = async () => {
        if (!inputText.trim()) return;

        setLoadingState(LoadingState.LOADING);
        try {
            const result = await improveText(inputText);
            setOutputText(result);
            setLoadingState(LoadingState.SUCCESS);

            // Save to history with full result
            addToHistory({
                type: 'EDIT',
                title: 'Düzenleme: ' + inputText.substring(0, 20) + '...',
                preview: result.substring(0, 50),
                fullContent: result // Save full content
            });
        } catch (error) {
            setLoadingState(LoadingState.ERROR);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-hidden shadow-2xl bg-background-light dark:bg-background-dark border-x border-gray-200 dark:border-gray-800">
            <TopAppBar title="Akademik Düzenleme" showBack={true} showHistory={true} />
            
            <main className="flex-1 overflow-y-auto pb-6">
                {/* Segmented Control */}
                <div className="px-4 py-4">
                    <div className="flex h-12 w-full items-center rounded-xl bg-gray-200 dark:bg-[#1c2333] p-1">
                        <button className="group flex h-full flex-1 items-center justify-center rounded-lg bg-white dark:bg-[#135bec] shadow-sm transition-all duration-200">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Düzenleyici</span>
                        </button>
                        <button className="group flex h-full flex-1 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
                            <span className="text-sm font-medium">Karşılaştır</span>
                        </button>
                    </div>
                </div>

                {/* Input Section */}
                <div className="px-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Taslak Metin</label>
                        <button 
                            onClick={async () => {
                                try {
                                    const text = await navigator.clipboard.readText();
                                    setInputText(text);
                                } catch (err) {
                                    console.error('Paste failed', err);
                                }
                            }}
                            className="text-xs font-semibold text-primary hover:text-blue-400 flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[16px]">content_paste</span>
                            Yapıştır
                        </button>
                    </div>
                    <div className="relative group">
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full resize-none rounded-xl border border-gray-300 dark:border-[#3b4354] bg-white dark:bg-[#1c2333] p-4 text-base leading-relaxed text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none min-h-[160px]" 
                            placeholder="Metninizi buraya yapıştırın veya yazın..." 
                        ></textarea>
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium bg-white/80 dark:bg-[#1c2333]/80 px-2 py-0.5 rounded">
                            {inputText.length} Karakter
                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="px-4 py-6 flex justify-center">
                    <button 
                        onClick={handleImprove}
                        disabled={loadingState === LoadingState.LOADING || !inputText.trim()}
                        className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary h-14 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {loadingState === LoadingState.LOADING ? (
                            <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                         ) : (
                            <>
                                <span className="material-symbols-outlined mr-2 text-white">auto_fix_high</span>
                                <span className="text-white text-base font-bold tracking-wide">Metni İyileştir</span>
                            </>
                         )}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
                    </button>
                </div>

                {/* Result Section */}
                {(outputText || loadingState === LoadingState.SUCCESS) && (
                    <div className="px-4 pb-6 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                Önerilen Düzenleme
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => navigator.clipboard.writeText(outputText)} className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors" title="Kopyala">
                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-green-500/20 bg-green-50/50 dark:bg-green-900/10 p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                                {outputText}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                    Akademik Üslup
                                </span>
                                <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                                    Dilbilgisi
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Tips */}
                <div className="px-4 mt-2">
                    <div className="rounded-lg bg-gray-100 dark:bg-[#1c2333] p-4 flex gap-3 items-start">
                        <span className="material-symbols-outlined text-yellow-500 mt-0.5">lightbulb</span>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p className="font-semibold mb-1 text-gray-900 dark:text-white">İpucu</p>
                            Akademik metinlerde "ben" dili yerine "edilgen" çatı kullanmak (örn: yapılmıştır, görülmüştür) nesnelliği artırır.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditingScreen;