import React, { useState, useRef, useEffect } from 'react';
import { TopAppBar } from '../components/Layouts';
import { chatWithAI } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { LoadingState } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatScreen: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Merhaba! Akademik araştırmalarınızda, metodoloji sorularınızda veya literatür taramanızda size nasıl yardımcı olabilirim?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || loadingState === LoadingState.LOADING) return;

        const userMsg = inputText;
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoadingState(LoadingState.LOADING);

        try {
            // Convert messages to history format expected by Gemini
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const responseText = await chatWithAI(userMsg, history);
            
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
            setLoadingState(LoadingState.IDLE);

            // Save conversation topic to history only once per session or significantly
            if (messages.length === 1) {
                 addToHistory({
                    type: 'CHAT',
                    title: 'Sohbet: ' + userMsg.substring(0, 20) + '...',
                    preview: responseText.substring(0, 50),
                });
            }

        } catch (error) {
            setLoadingState(LoadingState.ERROR);
            setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.' }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <TopAppBar title="Akademik Asistan" showBack={true} />

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-br-none' 
                                    : 'bg-white dark:bg-[#1e232e] text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-800'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loadingState === LoadingState.LOADING && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-[#1e232e] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800">
                             <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-[#101622] border-t border-gray-200 dark:border-gray-800 pb-safe">
                <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-[#1c2333] rounded-3xl p-2 pr-2">
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-gray-900 dark:text-white placeholder:text-gray-500"
                        placeholder="Bir şeyler sorun..."
                        rows={1}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim() || loadingState === LoadingState.LOADING}
                        className="flex items-center justify-center w-10 h-10 mb-1 rounded-full bg-primary text-white disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;