import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

const MedicalChatbot = ({ memberId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [exampleQuestions, setExampleQuestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load example questions
        loadExampleQuestions();

        // Add welcome message
        setMessages([{
            role: 'assistant',
            content: '👋 Hi! I\'m your Health Buddy assistant. I can help explain your lab results and provide general health information. What would you like to know?',
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadExampleQuestions = async () => {
        try {
            const { data } = await api.get('/chat/example-questions');
            setExampleQuestions(data.examples || []);
        } catch (error) {
            console.error('Error loading examples:', error);
        }
    };

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim()) return;

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post(`/chat/${memberId}`, {
                message: messageText
            });

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                sources: data.sources,
                labDataCount: data.labDataCount,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage = {
                role: 'assistant',
                content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
                isError: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleExampleClick = (question) => {
        sendMessage(question);
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: '👋 Chat cleared! What would you like to know?',
            timestamp: new Date()
        }]);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Disclaimer Banner */}
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div className="flex items-start">
                    <span className="text-yellow-600 text-xl mr-2">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-yellow-800">Medical Disclaimer</p>
                        <p className="text-xs text-yellow-700 mt-1">
                            This chatbot provides educational information only and is not a substitute for professional medical advice. Always consult your healthcare provider for medical concerns.
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <GlassCard className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-sage text-white'
                                        : msg.isError
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : 'bg-white/50 text-charcoal'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-charcoal/10">
                                        <p className="text-xs text-charcoal/60">
                                            📊 Based on {msg.labDataCount} lab results
                                        </p>
                                    </div>
                                )}

                                <p className="text-xs text-charcoal/40 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/50 p-3 rounded-lg">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-sage rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Example Questions */}
                {messages.length <= 1 && exampleQuestions.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-charcoal/60 mb-2">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                            {exampleQuestions.slice(0, 3).map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleExampleClick(q)}
                                    className="text-xs px-3 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage rounded-full transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                        placeholder="Ask about your health data..."
                        className="flex-1 px-4 py-2 rounded-input glass-input text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage transition-all"
                        disabled={loading}
                        maxLength={500}
                    />
                    <Button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="px-4 py-2 text-sm"
                    >
                        {loading ? '...' : '→'}
                    </Button>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-charcoal/40">
                        {input.length}/500
                    </p>
                    <button
                        onClick={clearChat}
                        className="text-xs text-charcoal/60 hover:text-charcoal transition-colors"
                    >
                        Clear chat
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default MedicalChatbot;
