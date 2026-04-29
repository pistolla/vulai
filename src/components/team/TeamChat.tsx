import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageSquare } from 'react-icons/fi';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: number;
    avatar?: string;
    isMascot?: boolean;
}

interface TeamChatProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    currentUser?: { name: string; avatar?: string };
    accentColor: string;
    isTyping?: boolean;
}

export const TeamChat: React.FC<TeamChatProps> = ({
    messages,
    onSendMessage,
    currentUser,
    accentColor,
    isTyping
}) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border-2 overflow-hidden flex flex-col h-[600px]" style={{ borderColor: accentColor }}>
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <FiMessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Team Chat</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {messages.length} messages
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
                    <span className="text-xl">🤖</span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">AI Mascot Active</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(message => {
                    const isAi = message.isMascot || message.user.toLowerCase().includes('mascot');
                    return (
                        <div key={message.id} className="flex space-x-3 animate-slide-in">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {isAi ? (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                                        <span className="text-xl">🐾</span>
                                    </div>
                                ) : message.avatar ? (
                                    <img
                                        src={message.avatar}
                                        alt={message.user}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-700">
                                        <span className="text-sm font-black text-white">{message.user.charAt(0)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline space-x-2 mb-1">
                                    <span className={`font-black text-sm ${isAi ? 'text-yellow-400 drop-shadow-md' : 'text-white'}`}>{message.user}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl rounded-tl-none border ${isAi ? 'bg-yellow-900/20 border-yellow-500/50 shadow-[0_0_10px_rgba(251,191,36,0.1)]' : 'bg-gray-800/50 border-gray-700'}`}>
                                    <p className={`text-sm ${isAi ? 'text-yellow-50 font-medium' : 'text-gray-200'}`}>{message.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex space-x-3 animate-slide-in">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                                <span className="text-xl animate-pulse">🐾</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline space-x-2 mb-1">
                                <span className="font-black text-sm text-yellow-400 drop-shadow-md">Mascot</span>
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-none border bg-yellow-900/20 border-yellow-500/50 inline-block">
                                <div className="flex space-x-1.5 items-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
                {currentUser ? (
                    <div className="space-y-3">
                        <div className="flex justify-start">
                            <button 
                                onClick={() => setNewMessage(prev => prev ? prev + ' @mascot ' : '@mascot ')}
                                className="px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-colors flex items-center space-x-1"
                            >
                                <span>🐾</span>
                                <span>Ask Mascot</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex space-x-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message... use @mascot to ask the AI!"
                                className="flex-1 px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="px-6 py-3 rounded-2xl font-black uppercase text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                style={{
                                    background: newMessage.trim() ? `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` : '#374151',
                                    color: 'white'
                                }}
                            >
                                <FiSend className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Login to join the conversation
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};
