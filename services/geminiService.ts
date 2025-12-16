import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash"; // Fast and capable for text tasks

// --- Existing Functions ---

export const translateText = async (text: string, targetLang: 'TR' | 'EN'): Promise<string> => {
    try {
        const prompt = targetLang === 'TR' 
            ? `Aşağıdaki metni akademik Türkçe'ye çevir. Resmi, nesnel ve akademik bir dil kullan. Sadece çeviriyi döndür.\n\nMetin: ${text}`
            : `Translate the following text to Academic English. Use formal, objective, and scholarly language. Return only the translation.\n\nText: ${text}`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });

        return response.text || "Çeviri yapılamadı.";
    } catch (error) {
        console.error("Translation error:", error);
        throw error;
    }
};

export const improveText = async (text: string): Promise<string> => {
    try {
        const prompt = `Sen uzman bir akademik editörsün. Aşağıdaki metni akademik standartlara (gramer, akıcılık, resmiyet, nesnellik) göre düzenle ve iyileştir. Anlam bütünlüğünü bozma. Sadece iyileştirilmiş metni döndür.\n\nMetin: ${text}`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });

        return response.text || "Düzenleme yapılamadı.";
    } catch (error) {
        console.error("Improvement error:", error);
        throw error;
    }
};

export const summarizeText = async (text: string, tone: string, length: number): Promise<string> => {
    try {
        const prompt = `Aşağıdaki metni ${tone} bir tonla özetle. Hedef kelime sayısı yaklaşık ${length} kelime olsun. Akademik bir dil kullan.\n\nMetin: ${text}`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });

        return response.text || "Özet oluşturulamadı.";
    } catch (error) {
        console.error("Summarization error:", error);
        throw error;
    }
};

export const chatWithAI = async (message: string, history: {role: string, parts: {text: string}[]}[] = []): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: modelId,
            history: history,
            config: {
                systemInstruction: "Sen yardımsever bir akademik asistansın. Kullanıcılara araştırma, yazım, literatür tarama ve akademik metodoloji konularında yardımcı oluyorsun. Cevapların kısa, öz ve akademik dilde olsun."
            }
        });

        const response = await chat.sendMessage({ message: message });
        return response.text || "Cevap alınamadı.";
    } catch (error) {
        console.error("Chat error:", error);
        throw error;
    }
};

// --- New Function for Document Editor ---

// Define the tool for updating the document
const updateDocumentTool: FunctionDeclaration = {
    name: 'updateDocument',
    description: 'Updates the entire document content with the new text provided. Use this whenever the user asks to edit, rewrite, fix, or change the document content.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            newContent: {
                type: Type.STRING,
                description: 'The full new content of the document after applying the changes.',
            },
        },
        required: ['newContent'],
    },
};

export const createDocumentChatSession = () => {
    return ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: "Sen 'Akademik Word Asistanı'sın. Kullanıcı bir belge yazıyor. Görevin, kullanıcının isteği üzerine belgedeki metni düzenlemek, genişletmek veya düzeltmek. Eğer kullanıcı metinde bir değişiklik isterse, SADECE sohbet etmekle kalma, `updateDocument` aracını kullanarak metni gerçekten güncelle. Kullanıcıya her zaman yaptığın değişikliği kısaca açıkla.",
            tools: [{ functionDeclarations: [updateDocumentTool] }],
        }
    });
};