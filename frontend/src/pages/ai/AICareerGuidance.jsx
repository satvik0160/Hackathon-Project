import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Send, Compass, Zap, Target, BookOpen, Star } from 'lucide-react';
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

  const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);
  const topSkill = userSkills.length > 0 ? userSkills[0] : 'Data Science';
  const role = user?.career_goal || 'Data Analyst';
  
  const predefinedQuestions = [
    { icon: <Target className="w-4 h-4"/>, text: `Am I ready for a ${role} internship?` },
    { icon: <Compass className="w-4 h-4"/>, text: `What are the most asked ${topSkill} interview questions?` },
    { icon: <BookOpen className="w-4 h-4"/>, text: `What should I learn next to become a ${role}?` },
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
      const contextPrefix = `[System Context: The user's career aim is '${role}' and their technical skills are: ${userSkills.join(', ')}. ONLY provide guidance relevant to these specific goals and skills.]\n`;
      const res = await aiService.careerCopilot({ query: contextPrefix + textToSend });
      const aiResponse = res.data?.reply || res.data?.response || "I couldn't process that request at the moment. Please try again.";
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
          <img src="/dhruvlogo.webp" alt="Dhruv" className="w-6 h-6 object-cover rounded-full" /> Dhruv
        </h1>
        <p className="text-sm text-muted">Your personal AI advisor for career growth</p>
      </header>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 chat-window">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              <div className={`chat-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'user' ? <User size={20} /> : <img src="/dhruvlogo.webp" alt="Dhruv" className="w-full h-full object-cover rounded-full" />}
              </div>
              <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="markdown-body"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                )}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="chat-message ai">
              <div className="chat-avatar ai">
                <img src="/dhruvlogo.webp" alt="Dhruv" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="chat-bubble ai typing-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div className="book-loader">
                  <div className="book-cover"></div>
                  <div className="static-page-left"></div>
                  <div className="static-page-right"></div>
                  <div className="page"></div>
                  <div className="page"></div>
                  <div className="page"></div>
                  <div className="page"></div>
                </div>
                <span className="text-sm font-medium text-slate-500">Searching...</span>
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
            className="flex gap-2 items-center bg-white border border-slate-200 rounded-full shadow-sm p-1 pr-2 mt-2"
          >
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-slate-800 placeholder-slate-400"
              style={{ boxShadow: 'none' }}
              placeholder="Ask anything about your career path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 overflow-hidden"
              style={{ minWidth: '48px', minHeight: '48px' }}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
