import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar, BottomNav } from '../components/Layouts';
import { getHistory } from '../services/historyService';
import { HistoryItem } from '../types';

const DashboardScreen: React.FC = () => {
    const navigate = useNavigate();
    const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const items = getHistory();
        setRecentHistory(items);
    }, []);

    const handleHistoryClick = (item: HistoryItem) => {
        // If it's a chat, ideally we go to chat, but for edit/translate/summarize
        // users usually want to continue working on the text in the Editor.
        if (item.type === 'CHAT') {
            navigate('/chat'); // Chat state restoration is complex, simple nav for now
        } else {
            // For text based tasks, open in the Document Editor to continue working
            navigate('/editor', { 
                state: { 
                    initialContent: item.fullContent || item.preview, // Fallback to preview if fullContent missing
                    source: 'history'
                } 
            });
        }
    };

    const getIconForType = (type: string) => {
        switch(type) {
            case 'TRANSLATE': return 'translate';
            case 'SUMMARIZE': return 'summarize';
            case 'EDIT': return 'check_circle';
            case 'CHAT': return 'smart_toy';
            default: return 'article';
        }
    };

    const getColorForType = (type: string) => {
        switch(type) {
            case 'TRANSLATE': return 'bg-blue-100 text-primary dark:bg-blue-900/30';
            case 'SUMMARIZE': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30';
            case 'EDIT': return 'bg-green-100 text-green-600 dark:bg-green-900/30';
            case 'CHAT': return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getLabelForType = (type: string) => {
         switch(type) {
            case 'TRANSLATE': return 'Çeviri';
            case 'SUMMARIZE': return 'Özet';
            case 'EDIT': return 'Düzenleme';
            case 'CHAT': return 'Sohbet';
            default: return 'İşlem';
        }
    };

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} sa önce`;
        return 'Dün';
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-20">
            <TopAppBar title="Görev Paneli" />

            {/* Greeting Headline */}
            <div className="px-4 pt-6 pb-2">
                <h3 className="text-gray-900 dark:text-white tracking-tight text-2xl font-bold leading-tight">Hoş geldin, Akademisyen</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Bugün hangi akademik çalışmaya odaklanıyoruz?</p>
            </div>

            {/* SearchBar */}
            <div className="px-4 py-4">
                <label className="flex flex-col h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                        <div className="text-gray-500 dark:text-[#9da6b9] flex border-none bg-white dark:bg-[#282e39] items-center justify-center pl-4 rounded-l-xl border-r-0">
                            <span className="material-symbols-outlined" style={{fontSize: "24px"}}>search</span>
                        </div>
                        <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-[#282e39] h-full placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-4 rounded-l-none pl-2 text-base font-normal leading-normal" placeholder="Literatür, taslak veya not ara..." />
                    </div>
                </label>
            </div>

            {/* Editor CTA - NEW BIG BUTTON */}
            <div className="px-4 pb-2">
                 <button onClick={() => navigate('/editor')} className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#135bec] to-[#4285f4] p-5 text-white shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.99]">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="text-left">
                            <div className="mb-1 flex items-center gap-2">
                                <span className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                                </span>
                                <span className="text-sm font-semibold tracking-wide text-blue-100">Yeni Özellik</span>
                            </div>
                            <h3 className="text-xl font-bold leading-tight">Akademik Yazım Editörü</h3>
                            <p className="mt-1 text-sm font-medium text-blue-100/90 max-w-[240px]">Yapay zeka asistanı eşliğinde makalenizi yazın ve anlık düzenleyin.</p>
                        </div>
                        <span className="material-symbols-outlined text-[48px] text-white/20">stylus_note</span>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-blue-900/20 blur-xl"></div>
                </button>
            </div>

            {/* Quick Action Grid */}
            <div className="px-4 pb-2 mt-4">
                <h4 className="text-gray-900 dark:text-white text-base font-bold mb-3">Hızlı Araçlar</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/translate')} className="group flex flex-col items-start justify-between p-4 h-32 rounded-xl bg-white dark:bg-[#1e232e] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all duration-200">
                        <div className="flex items-center justify-center size-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary">
                            <span className="material-symbols-outlined text-[20px]">translate</span>
                        </div>
                        <div className="text-left">
                            <p className="text-gray-900 dark:text-white text-sm font-bold">Çevir</p>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">TR &lt;-&gt; EN</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/summarize')} className="group flex flex-col items-start justify-between p-4 h-32 rounded-xl bg-white dark:bg-[#1e232e] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all duration-200">
                        <div className="flex items-center justify-center size-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-[20px]">summarize</span>
                        </div>
                        <div className="text-left">
                            <p className="text-gray-900 dark:text-white text-sm font-bold">Özetle</p>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Makale Özeti</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/edit')} className="group flex flex-col items-start justify-between p-4 h-32 rounded-xl bg-white dark:bg-[#1e232e] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all duration-200">
                        <div className="flex items-center justify-center size-9 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                        <div className="text-left">
                            <p className="text-gray-900 dark:text-white text-sm font-bold">Düzelt</p>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Gramer & Stil</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/chat')} className="group flex flex-col items-start justify-between p-4 h-32 rounded-xl bg-white dark:bg-[#1e232e] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all duration-200">
                        <div className="flex items-center justify-center size-9 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                        </div>
                        <div className="text-left">
                            <p className="text-gray-900 dark:text-white text-sm font-bold">Asistan</p>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">Sohbet</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Works Header */}
            <div className="flex items-center justify-between px-4 pt-6 pb-2">
                <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Son İşlemler</h3>
                {recentHistory.length > 0 && <button className="text-primary text-sm font-medium hover:text-primary/80">Tümünü Gör</button>}
            </div>

            {/* Recent Works List */}
            <div className="flex flex-col gap-2 px-4 pb-4">
                {recentHistory.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                        <p>Henüz bir işlem yapmadınız.</p>
                    </div>
                ) : (
                    recentHistory.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => handleHistoryClick(item)}
                            className="group flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-[#1e232e] border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up cursor-pointer hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-[#252b38] transition-all"
                        >
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${getColorForType(item.type)}`}>
                                <span className="material-symbols-outlined">{getIconForType(item.type)}</span>
                            </div>
                            <div className="flex flex-1 flex-col justify-center overflow-hidden">
                                <p className="text-gray-900 dark:text-white text-base font-medium leading-tight truncate">{item.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                        {getLabelForType(item.type)}
                                    </span>
                                    <span className="text-gray-400 text-xs">{formatTime(item.timestamp)}</span>
                                </div>
                            </div>
                            <button className="text-gray-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="h-20"></div>
            <BottomNav />
        </div>
    );
};

export default DashboardScreen;