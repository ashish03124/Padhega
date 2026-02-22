"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../hooks/useVideoCall';

interface ChatPanelProps {
    messages: ChatMessage[];
    userName: string;
    onSendMessage: (message: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    userName,
    onSendMessage,
    isOpen,
    onToggle,
}) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <button className="chat-toggle-btn" onClick={onToggle} title="Toggle chat">
                <i className="fas fa-comments"></i>
                {messages.length > 0 && !isOpen && (
                    <span className="chat-badge">{messages.length}</span>
                )}
            </button>

            <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <h3>
                        <i className="fas fa-comments"></i> Chat
                    </h3>
                    <button className="close-chat-btn" onClick={onToggle}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="no-messages">
                            <i className="fas fa-comment-dots"></i>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chat-message ${msg.fromId === 'local' ? 'own-message' : ''}`}
                            >
                                <div className="message-header">
                                    <span className="sender-name">{msg.fromName}</span>
                                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                                </div>
                                <div className="message-content">{msg.message}</div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={!newMessage.trim()}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatPanel;
