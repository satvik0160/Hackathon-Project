import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CareerCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I\'m your Career Copilot. Ask me anything about your skills, career path, or learning goals.' }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//localhost:8000/ws/chat/`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stream') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'ai' && last.streaming) {
              return [...prev.slice(0, -1), { ...last, content: last.content + data.message }];
            }
            return [...prev, { role: 'ai', content: data.message, streaming: true }];
          });
        } else if (data.type === 'end_stream') {
          setMessages(prev => prev.map(m => ({ ...m, streaming: false })));
          setIsStreaming(false);
        } else if (data.type === 'error') {
          setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${data.message}` }]);
          setIsStreaming(false);
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      setIsStreaming(false);
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    wsRef.current = ws;
    return ws;
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);

    // Try WebSocket first, fall back to REST
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        // Wait for connection
        await new Promise((resolve, reject) => {
          const ws = wsRef.current;
          if (!ws) { reject(); return; }
          ws.onopen = resolve;
          setTimeout(reject, 3000);
        });
      }
      wsRef.current.send(JSON.stringify({ message: userMessage }));
    } catch {
      // Fallback to REST API
      try {
        const { aiService } = await import('../../services/api');
        const res = await aiService.careerCopilot(userMessage);
        setMessages(prev => [...prev, { role: 'ai', content: res.data.reply || 'I couldn\'t process that request.' }]);
      } catch {
        setMessages(prev => [...prev, { role: 'ai', content: 'I\'m having trouble connecting right now. Please try again later.' }]);
      }
      setIsStreaming(false);
    }
  };

  const suggestions = [
    "What should I learn today?",
    "Am I ready for internships?",
    "What's my weakest skill?",
    "How to improve my resume?",
  ];

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        className="copilot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Career Copilot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="copilot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="copilot-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                <span className="font-semibold">Career Copilot</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>AI Powered</span>
            </div>

            <div className="copilot-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`copilot-message ${msg.role}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {msg.content}
                  {msg.streaming && (
                    <span className="animate-pulse" style={{ marginLeft: '4px' }}>▌</span>
                  )}
                </motion.div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== 'ai' && (
                <div className="copilot-message ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (show only when few messages) */}
            {messages.length <= 2 && (
              <div className="copilot-suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="copilot-suggestion" onClick={() => { setInput(s); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="copilot-input-area">
              <input
                ref={inputRef}
                className="copilot-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={isStreaming}
              />
              <button
                className="btn btn-primary btn-icon"
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
