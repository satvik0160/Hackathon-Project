import re

with open('frontend/src/components/features/CareerCopilot.jsx', 'r') as f:
    content = f.read()

# Add ReactMarkdown import
if 'import ReactMarkdown from' not in content:
    content = content.replace("import { useState", "import ReactMarkdown from 'react-markdown';\nimport { useState")

# Fix renderMessageContent
content = content.replace('{parts[0]}', '<ReactMarkdown>{parts[0]}</ReactMarkdown>')
content = content.replace('{parts[1]}', '<ReactMarkdown>{parts[1]}</ReactMarkdown>')
content = content.replace('return content;', 'return <ReactMarkdown>{content}</ReactMarkdown>;')
content = content.replace("backgroundColor: '#f8fafc'", "backgroundColor: '#0f172a'")
content = content.replace("fill: '#64748b'", "fill: '#94a3b8'")

# Fix Dark Theme for Header
content = content.replace('<span className="font-semibold">Dhruv</span>', '<span className="font-semibold text-white">Dhruv</span>')

# Fix Dark Theme for thinking text
content = content.replace('text-slate-500', 'text-neutral-400')

# Fix Input Area
old_input = '''<div className="p-4 border-t border-blue-50 bg-slate-100">
              <div className="flex gap-2 relative">
                <input
                  ref={inputRef}
                  className="form-input w-full pr-12 py-3 rounded-full shadow-sm bg-[#f8faff] border-blue-50 text-slate-800 placeholder-slate-400 focus:border-primary/50"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  disabled={isStreaming}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>'''

new_input = '''<div className="p-4 border-t border-white/10 bg-neutral-900/60">
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2 relative">
                <input
                  ref={inputRef}
                  className="form-input w-full pr-12 py-3 rounded-full shadow-sm bg-neutral-800/50 border-white/10 text-white placeholder-neutral-500 focus:border-primary/50 outline-none"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-slate-900 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>'''

content = content.replace(old_input, new_input)

with open('frontend/src/components/features/CareerCopilot.jsx', 'w') as f:
    f.write(content)

with open('frontend/src/pages/ai/AICareerGuidance.jsx', 'r') as f:
    aic_content = f.read()

# Fix Light Theme in AICareerGuidance
aic_content = aic_content.replace('bg-white', 'bg-neutral-900/60 backdrop-blur-lg text-white')
aic_content = aic_content.replace('border-gray-100', 'border-white/10')
aic_content = aic_content.replace('bg-gray-50', 'bg-neutral-900/40')
aic_content = aic_content.replace('border-gray-200', 'border-white/10')

# Fix text visibility for user messages
aic_content = aic_content.replace('placeholder="Ask anything about your career path..."', 'placeholder="Ask anything about your career path..." style={{color: "#fff"}}')

# Fix form in AICareerGuidance (if the user couldn't see the send button, maybe the form styling is weird)
old_aic_input = '''<input
              type="text"
              className="form-input w-full pr-12 py-3 rounded-full shadow-sm"
              placeholder="Ask anything about your career path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />'''

new_aic_input = '''<input
              type="text"
              className="form-input w-full pr-12 py-3 rounded-full shadow-sm bg-neutral-800/50 border-white/10 text-white placeholder-neutral-500 outline-none"
              placeholder="Ask anything about your career path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />'''

aic_content = aic_content.replace(old_aic_input, new_aic_input)

with open('frontend/src/pages/ai/AICareerGuidance.jsx', 'w') as f:
    f.write(aic_content)

print("Done")
