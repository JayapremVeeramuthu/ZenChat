import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ChatContext = createContext();

export const LANGUAGES = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'bn', name: 'Bengali', native: 'বাংলা' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { id: 'mr', name: 'Marathi', native: 'मराठी' },
    { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { id: 'fr', name: 'French', native: 'Français' },
];

// Simulated Backend Translation Service
const TranslationService = {
    translate: async (text, fromLang, toLang) => {
        await new Promise(r => setTimeout(r, 200)); // Simulate network latency

        if (fromLang === toLang) return text;

        const phrases = {
            'Hello': { 'ta': 'வணக்கம்', 'hi': 'नमस्ते', 'fr': 'Bonjour', 'te': 'నమస్కారం', 'bn': 'হ্যালো' },
            'How are you?': { 'ta': 'எப்படி இருக்கிறீர்கள்?', 'hi': 'आप कैसे हैं?', 'fr': 'Comment allez-vous?', 'te': 'ఎలా ఉన్నారు?' },
            'Good morning': { 'ta': 'காலை வணக்கம்', 'hi': 'शुभ प्रभात', 'fr': 'Bonjour' },
            'I am typing a message': { 'ta': 'நான் ஒரு செய்தியைத் தட்டச்சு செய்கிறேன்', 'hi': 'मैं एक संदेश टाइप कर रहा हूँ' },
            'Let’s meet tomorrow.': { 'ta': 'நாளை சந்திப்போம்.', 'hi': 'कल मिलते हैं।', 'fr': 'On se voit demain.' },
            'Have a great day!': { 'hi': 'आपका दिन शुभ हो!', 'ta': 'இந்த நாள் இனிய நாளாக அமையட்டும்!' },
            'Where are you?': { 'hi': 'आप कहाँ हैं?', 'ta': 'நீங்கள் எங்கே இருக்கிறீர்கள்?' }
        };

        // Preserve emojis
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        const emojis = text.match(emojiRegex) || [];
        const plainText = text.replace(emojiRegex, '').trim();

        const translated = phrases[plainText]?.[toLang] || `[${toLang}] ${plainText}`;
        return `${translated} ${emojis.join('')}`.trim();
    }
};

const INITIAL_CHATS = [
    {
        id: '1',
        name: 'Sarah Connor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        status: 'online',
        lastSeen: null,
        language: 'en'
    },
    {
        id: '2',
        name: 'Rajesh Kumar',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
        status: 'offline',
        lastSeen: '5 min ago',
        language: 'hi'
    },
    {
        id: '3',
        name: 'Anjali Devi',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
        status: 'online',
        lastSeen: null,
        language: 'ta'
    },
    {
        id: '4',
        name: 'Pierre Dubois',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre',
        status: 'online',
        lastSeen: null,
        language: 'fr'
    }
];

export const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [typingStatus, setTypingStatus] = useState({}); // { chatId: { isTyping: true, language: 'en' } }

    const updateMessageStatus = useCallback((chatId, messageId, status) => {
        setMessages(prev => {
            const chatMsgs = [...(prev[chatId] || [])];
            const msgIdx = chatMsgs.findIndex(m => m.id === messageId);
            if (msgIdx > -1) {
                chatMsgs[msgIdx] = { ...chatMsgs[msgIdx], status };
            }
            return { ...prev, [chatId]: chatMsgs };
        });
    }, []);

    const sendMessage = async (text) => {
        if (!currentChat || !text.trim()) return;

        const messageId = Date.now();
        const newMessage = {
            id: messageId,
            senderId: 'me',
            originalText: text,
            translatedText: text, // Self-sent messages don't need translation for 'me'
            sourceLanguage: selectedLanguage.id,
            targetLanguage: selectedLanguage.id,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        setMessages(prev => ({
            ...prev,
            [currentChat.id]: [...(prev[currentChat.id] || []), newMessage]
        }));

        // Simulate delivery/read status
        setTimeout(() => updateMessageStatus(currentChat.id, messageId, 'delivered'), 1000);
        setTimeout(() => updateMessageStatus(currentChat.id, messageId, 'read'), 2500);

        // Simulate response flow
        simulateResponse(currentChat);
    };

    const simulateResponse = async (chat) => {
        // 1. Show partner is typing
        setTimeout(() => {
            setTypingStatus(prev => ({ ...prev, [chat.id]: { isTyping: true, language: chat.language } }));
        }, 1500);

        // 2. Clear typing and send message
        setTimeout(async () => {
            setTypingStatus(prev => ({ ...prev, [chat.id]: null }));

            const possibleResponses = [
                'Hello',
                'How are you?',
                'Good morning',
                'Have a great day! 😊',
                'Where are you?'
            ];
            const randomResponse = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

            // "Backend" translation logic
            const translatedText = await TranslationService.translate(randomResponse, chat.language, selectedLanguage.id);

            const responseMessage = {
                id: Date.now(),
                senderId: chat.id,
                originalText: randomResponse,
                translatedText: translatedText,
                sourceLanguage: chat.language,
                targetLanguage: selectedLanguage.id,
                timestamp: new Date().toISOString(),
                status: 'read'
            };

            setMessages(prev => ({
                ...prev,
                [chat.id]: [...(prev[chat.id] || []), responseMessage]
            }));
        }, 4000);
    };

    const logout = () => {
        setUser(null);
        setSelectedLanguage(null);
        setOnboardingStep(1);
    };

    return (
        <ChatContext.Provider value={{
            user, setUser,
            selectedLanguage, setSelectedLanguage,
            currentChat, setCurrentChat,
            messages, setMessages,
            onboardingStep, setOnboardingStep,
            chats: INITIAL_CHATS,
            sendMessage,
            logout,
            typingStatus,
            TranslationService
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within ChatProvider');
    return context;
};
