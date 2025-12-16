import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopAppBar } from '../components/Layouts';
import { createDocumentChatSession } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import { LoadingState } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const DocumentEditorScreen: React.FC = () => {
    const location = useLocation();
    const editorRef = useRef<HTMLDivElement>(null);

    // Initial State loading
    const [documentContent, setDocumentContent] = useState<string>("");
    
    // History State for Undo/Redo
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Merhaba! Ben editör asistanınızım. Yandaki metin üzerinde ne gibi değişiklikler yapmamı istersiniz?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    const [showToast, setShowToast] = useState(false);
    
    // Maintain a ref to the chat session
    const chatSessionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatSessionRef.current = createDocumentChatSession();
        
        // Handle Resume from Dashboard
        const state = location.state as { initialContent?: string, source?: string } | null;
        const initialText = state?.initialContent || "<p>Akademik çalışmanızı buraya yazmaya başlayın...</p>";
        
        setDocumentContent(initialText);
        setHistory([initialText]);
        setHistoryIndex(0);

        // Safely set innerHTML on mount
        if (editorRef.current) {
            editorRef.current.innerHTML = initialText;
        }

    }, [location.state]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Toolbar Functions (Using execCommand for actual rich text) ---

    const executeCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            handleContentChange(content);
        }
        editorRef.current?.focus();
    };

    const handleContentChange = (newContent: string) => {
        setDocumentContent(newContent);
        
        // Add to history if it's different (debounce could be added here for optimization)
        const currentHistory = history.slice(0, historyIndex + 1);
        if (currentHistory[currentHistory.length - 1] !== newContent) {
            const newHistory = [...currentHistory, newContent];
            if (newHistory.length > 50) newHistory.shift();
            
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const content = history[newIndex];
            setHistoryIndex(newIndex);
            setDocumentContent(content);
            if (editorRef.current) editorRef.current.innerHTML = content;
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const content = history[newIndex];
            setHistoryIndex(newIndex);
            setDocumentContent(content);
            if (editorRef.current) editorRef.current.innerHTML = content;
        }
    };

    const handleSave = () => {
        // Get text preview by stripping HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = documentContent;
        const textPreview = tempDiv.textContent || tempDiv.innerText || "";

        addToHistory({
            type: 'EDIT',
            title: 'Taslak: ' + textPreview.substring(0, 20) + '...',
            preview: textPreview.substring(0, 50),
            fullContent: documentContent // Saving the HTML content
        });
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // --- Chat Functions ---

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !chatSessionRef.current) return;

        const userMsg = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoadingState(LoadingState.LOADING);

        try {
            // Send plain text for context, but update with HTML if tool called
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = documentContent;
            const plainTextContext = tempDiv.innerText;

            const messageWithContext = `Current Document Content (Plain Text Representation):\n"""${plainTextContext}"""\n\nUser Request: ${userMsg}`;

            let response = await chatSessionRef.current.sendMessage({ message: messageWithContext });
            
            const functionCalls = response.functionCalls;

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                if (call.name === 'updateDocument') {
                    const args = call.args as any;
                    // The model returns plain text updates usually. We might lose formatting if we just replace.
                    // Ideally, the model should return HTML or we instruct it better.
                    // For this demo, we assume the model returns text and we put it in paragraphs.
                    let newText = args.newContent;
                    
                    // Simple conversion to keep it visible in rich editor if model sends plain text
                    if (!newText.includes('<')) {
                         newText = newText.split('\n').map((line: string) => `<p>${line}</p>`).join('');
                    }
                    
                    // Update UI
                    handleContentChange(newText);
                    if (editorRef.current) editorRef.current.innerHTML = newText;
                    
                    // Construct function response part
                    const functionResponsePart = {
                        functionResponse: {
                            name: call.name,
                            response: { result: "Document updated successfully." },
                            // If the API provided an ID, we must return it.
                            id: call.id
                        }
                    };

                    // Send the function response back to the model to get the final text response
                    response = await chatSessionRef.current.sendMessage({
                        message: [functionResponsePart]
                    });
                }
            }

            const responseText = response.text || "İşlem tamamlandı.";
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
            setLoadingState(LoadingState.IDLE);

        } catch (error) {
            console.error("Chat Error:", error);
            setLoadingState(LoadingState.ERROR);
            setMessages(prev => [...prev, { role: 'model', text: 'Bir hata oluştu.' }]);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f3f4f6] dark:bg-[#0d1117] overflow-hidden relative">
            <TopAppBar title="Akademik Yazım Editörü" showBack={true} />

            {/* Toast Notification */}
            {showToast && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                    <span>Başarıyla kaydedildi</span>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Editor Area */}
                <div className={`flex-1 flex flex-col items-center overflow-y-auto p-4 md:p-8 transition-all duration-300 ${isChatOpen ? 'mr-[320px] hidden md:flex' : ''}`}>
                    {/* Toolbar */}
                    <div className="w-full max-w-[800px] bg-white dark:bg-[#1e232e] rounded-t-xl border-b border-gray-200 dark:border-gray-700 p-2 flex gap-2 items-center mb-0 shadow-sm z-10 sticky top-0">
                        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
                            <button 
                                onClick={handleUndo} 
                                disabled={historyIndex <= 0}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed" 
                                title="Geri Al"
                            >
                                <span className="material-symbols-outlined text-[20px]">undo</span>
                            </button>
                            <button 
                                onClick={handleRedo} 
                                disabled={historyIndex >= history.length - 1}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="İleri Al"
                            >
                                <span className="material-symbols-outlined text-[20px]">redo</span>
                            </button>
                        </div>
                        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
                            <button onClick={() => executeCommand('bold')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-serif font-bold w-8 hover:text-primary" title="Kalın">B</button>
                            <button onClick={() => executeCommand('italic')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-serif italic w-8 hover:text-primary" title="İtalik">I</button>
                            <button onClick={() => executeCommand('underline')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 underline w-8 hover:text-primary" title="Altı Çizili">U</button>
                        </div>
                         <div className="flex gap-1 ml-auto">
                             <button 
                                onClick={handleSave}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                             >
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                <span>Kaydet</span>
                             </button>
                        </div>
                    </div>

                    {/* The Page (ContentEditable) */}
                    <div
                        ref={editorRef}
                        contentEditable={true}
                        onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
                        className="w-full max-w-[800px] min-h-[800px] h-full bg-white dark:bg-[#1e232e] text-gray-900 dark:text-gray-100 p-8 md:p-12 shadow-lg outline-none text-lg leading-relaxed font-serif selection:bg-primary/20 empty:before:content-[attr(placeholder)] empty:before:text-gray-400 cursor-text"
                        spellCheck={false}
                    />
                    <div className="h-8"></div>
                </div>

                {/* Mobile Editor View (When Chat is closed) */}
                <div className={`flex-1 flex flex-col items-center overflow-y-auto p-4 ${isChatOpen ? 'flex md:hidden' : 'hidden'}`}>
                     <div
                        contentEditable={true}
                        onInput={(e) => {
                             const val = e.currentTarget.innerHTML;
                             setDocumentContent(val);
                             if(editorRef.current) editorRef.current.innerHTML = val;
                        }}
                        dangerouslySetInnerHTML={{__html: documentContent}}
                        className="w-full h-full bg-white dark:bg-[#1e232e] rounded-xl p-4 shadow-sm outline-none overflow-y-auto"
                    />
                </div>

                {/* AI Assistant Sidebar */}
                <div className={`fixed inset-y-0 right-0 w-full md:w-[320px] bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-40 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">smart_toy</span>
                            <h3 className="font-bold text-gray-900 dark:text-white">Asistan</h3>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="md:hidden p-1 hover:bg-gray-200 rounded-full">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-[#0d1117]/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-br-none' 
                                    : 'bg-white dark:bg-[#1e232e] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loadingState === LoadingState.LOADING && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#1e232e] p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef}></div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22]">
                        <div className="relative">
                            <textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="w-full bg-gray-100 dark:bg-[#0d1117] border-none rounded-xl py-3 pl-3 pr-10 text-sm resize-none focus:ring-1 focus:ring-primary"
                                placeholder="Örn: 'Son paragrafı daha resmi yaz'"
                                rows={2}
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={loadingState === LoadingState.LOADING || !chatInput.trim()}
                                className="absolute right-2 bottom-2 p-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                         <p className="text-[10px] text-gray-400 mt-2 text-center">Asistan metni doğrudan düzenleyebilir.</p>
                    </div>
                </div>

                {/* Toggle Button (When Chat is closed) */}
                {!isChatOpen && (
                    <button 
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-xl hover:bg-blue-600 flex items-center justify-center z-30 animate-fade-in-up"
                    >
                        <span className="material-symbols-outlined text-[28px]">chat</span>
                    </button>
                )}
                 {/* Mobile Toggle Trigger */}
                 <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`fixed bottom-6 right-6 size-12 bg-white dark:bg-[#1e232e] text-primary border border-primary/20 rounded-full shadow-lg flex md:hidden items-center justify-center z-50 ${isChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                </button>
            </div>
        </div>
    );
};

export default DocumentEditorScreen;