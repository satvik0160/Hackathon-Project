import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Send, Compass, Zap, Target, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { aiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AICareerGuidance() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hello ${user?.username || 'there'}! I'm your AI Career Advisor. Based on your profile, you're aiming for **${user?.career_goal || 'a new role'}**. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const predefinedQuestions = [
    { icon: <Target className="w-4 h-4"/>, text: 'Am I ready for a Data Science internship?' },
    { icon: <Compass className="w-4 h-4"/>, text: 'Compare: ML Engineer vs Data Analyst' },
    { icon: <BookOpen className="w-4 h-4"/>, text: 'What should I learn next?' },
    { icon: <Zap className="w-4 h-4"/>, text: 'How strong is my profile?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (query) => {
    const textToSend = typeof query === 'string' ? query : input;
    if (!textToSend.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.careerCopilot({ query: textToSend });
      const aiResponse = res.data?.response || "I couldn't process that request at the moment. Please try again.";
      setMessages([...newMessages, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      toast.error('Failed to get response from AI');
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I encountered an error while trying to help you. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container h-[calc(100vh-80px)] flex flex-col pt-6 pb-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" /> Career Copilot
        </h1>
        <p className="text-sm text-muted">Your personal AI advisor for career growth</p>
      </header>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-blue-100 text-blue-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-50 border border-gray-100 rounded-tl-sm prose prose-sm max-w-none'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {predefinedQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(q.text)}
                className="chip bg-white border border-gray-200 hover:border-primary hover:text-primary whitespace-nowrap px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                {q.icon} {q.text}
              </button>
            ))}
          </div>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              className="form-input w-full pr-12 py-3 rounded-full shadow-sm"
              placeholder="Ask anything about your career path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
