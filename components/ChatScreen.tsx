import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft as LucideArrowLeft, Send as LucideSend, Phone as LucidePhone, CreditCard as LucideCreditCard, MessageSquare as LucideMessageSquare } from 'lucide-react';
import { User } from '../types';
import { databaseService } from '../services/databaseService';

interface ChatScreenProps {
    currentUser: User;
    isAdmin: boolean;
    onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ currentUser, onBack }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const sanitizedPhone = currentUser.phone?.replace(/\D/g, '') || 'Unknown';
    const chatUserId = sanitizedPhone;

    useEffect(() => {
        const unsubscribe = databaseService.onAdminChatUpdate(chatUserId, (msgs) => {
            setMessages(msgs);
            databaseService.markAdminMessagesAsRead(chatUserId, 'admin');
        });
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
        };
    }, [chatUserId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        
        const message = {
            text: inputText,
            sender: 'user',
            timestamp: Date.now(),
            isRead: false
        };

        await databaseService.saveAdminChatMessage(chatUserId, message);
        setInputText('');
    };

    const handleWhatsApp = () => {
        const url = `https://wa.me/2250705052632?text=Besoin d'assistance pour le compte ${currentUser.name}`;
        window.open(url, '_blank');
    };

    const handlePayment = (amount?: number | string) => {
        onBack();
        setTimeout(() => {
            const detail = {
                title: 'Frais de mise en relation',
                amount: amount ? String(amount) : '310',
                paymentType: 'frais_mise_en_relation',
                waveLink: `https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${amount || 310}`
            };
            window.dispatchEvent(new CustomEvent('trigger-payment-view', { detail }));
        }, 300);
    };

    return (
        <div className="fixed inset-0 bg-[#E4E3E0] z-[1000] flex flex-col font-sans">
            <header className="bg-white p-4 flex items-center justify-between border-b border-black/5 shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <LucideArrowLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <div>
                        <h2 className="font-black uppercase text-sm text-slate-900 tracking-tight flex items-center">
                            FILANT ASSISTANT 
                            <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </h2>
                        <p className="text-[10px] text-slate-500 font-medium">Réponse en quelques minutes</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleWhatsApp} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                        <LucidePhone className="w-5 h-5" />
                    </button>
                    <button onClick={() => handlePayment()} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <LucideCreditCard className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-sm">
                             <LucideMessageSquare className="w-12 h-12 mb-2" />
                             Aucun message. Commencez la discussion.
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-800 rounded-tl-none border border-black/5'
                                    }`}>
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        
                                        {msg.paymentInfo && (
                                            <button 
                                                onClick={() => handlePayment(msg.paymentInfo.amount)}
                                                className="mt-3 w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                            >
                                                <LucideCreditCard className="w-4 h-4" />
                                                Payer {msg.paymentInfo.amount} CFA
                                            </button>
                                        )}
                                        
                                        {msg.whatsAppPayload && (
                                            <button 
                                                onClick={() => {
                                                    const url = `https://wa.me/${msg.whatsAppPayload.phone.replace('+', '')}?text=${encodeURIComponent(msg.whatsAppPayload.text)}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="mt-2 w-full py-3 bg-green-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                            >
                                                <LucidePhone className="w-4 h-4" />
                                                WhatsApp
                                            </button>
                                        )}

                                        <span className={`text-[9px] opacity-60 mt-2 block text-right font-mono italic ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-white border-t border-black/5 shadow-2xl">
                <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-colors">
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tapez votre message..."
                        className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-medium"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl disabled:bg-slate-300 transition-all hover:bg-blue-700 active:scale-95 shadow-lg"
                    >
                        <LucideSend className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;
