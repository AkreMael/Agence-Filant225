import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab } from '../types';
import { MessageSquare as LucideMessageSquare } from 'lucide-react';

interface ChatWidgetProps {
    userPhone: string;
    userId?: string;
    userName?: string;
    activeTab: Tab;
    currentMenuView: string;
    unreadChatCount: number;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ unreadChatCount, activeTab }) => {
    // Ne pas afficher si on est déjà sur l'onglet chat
    if (activeTab === Tab.UserChat) return null;

    const handleOpenChat = () => {
        window.dispatchEvent(new CustomEvent('trigger-chat-message'));
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenChat}
                className={`fixed bottom-24 right-4 z-[999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
                    unreadChatCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                }`}
            >
                <div className="text-white">
                    <LucideMessageSquare className="w-6 h-6" />
                </div>

                {unreadChatCount > 0 && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-red-600 shadow-lg"
                    >
                        {unreadChatCount}
                    </motion.div>
                )}
            </motion.button>
        </AnimatePresence>
    );
};

export default ChatWidget;
