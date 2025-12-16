import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopAppBarProps {
    title: string;
    showBack?: boolean;
    showSettings?: boolean;
    showHistory?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, showBack = false, showSettings = false, showHistory = false }) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 flex-1">
                {showBack && (
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                )}
                
                <h2 className={`text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] ${showBack ? "" : "flex-1 text-center"} ${showBack && title ? "text-xl font-bold tracking-tight" : ""}`}>
                    {title}
                </h2>
            </div>

            <div className="flex items-center justify-end gap-2">
                    {showHistory && (
                        <button className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-gray-900 dark:text-white">history</span>
                    </button>
                )}
                {showSettings ? (
                    <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                    </button>
                ) : (
                    <div className="flex w-12 items-center justify-end">
                        <button className="relative flex cursor-pointer items-center justify-center rounded-full size-10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined" style={{fontSize: "24px"}}>notifications</span>
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background-light dark:border-background-dark"></span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[80px] items-start justify-around bg-white/90 dark:bg-[#101622]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pt-3 pb-safe px-6">
            <button 
                onClick={() => navigate('/')} 
                className={`flex flex-col items-center justify-center gap-1 w-20 transition-colors ${isActive('/') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                <span className={`material-symbols-outlined text-[28px] ${isActive('/') ? "font-variation-settings-'FILL'1" : ""}`}>home</span>
                <span className="text-[10px] font-medium">Panel</span>
            </button>
            
            {/* FAB Center Button - Navigate to Translate by default for demo */}
            <div className="relative -top-8">
                <button 
                    onClick={() => navigate('/translate')}
                    className="flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined text-[32px]">add</span>
                </button>
            </div>

            <button 
                onClick={() => navigate('/chat')} 
                className={`flex flex-col items-center justify-center gap-1 w-20 transition-colors ${isActive('/chat') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                <span className={`material-symbols-outlined text-[28px] ${isActive('/chat') ? "font-variation-settings-'FILL'1" : ""}`}>smart_toy</span>
                <span className="text-[10px] font-medium">Asistan</span>
            </button>
        </nav>
    );
};