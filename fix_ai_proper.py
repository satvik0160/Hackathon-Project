import re

# ------------- Fix CareerCopilot.jsx -------------
with open('frontend/src/components/features/CareerCopilot.jsx', 'r') as f:
    content = f.read()

# Add ReactMarkdown import
if 'import ReactMarkdown from' not in content:
    content = content.replace("import { useState", "import ReactMarkdown from 'react-markdown';\nimport { useState")

# Fix renderMessageContent to use ReactMarkdown (and keep existing light styles which invert to dark)
# We just wrap content in ReactMarkdown.
# For the radar chart, we wrap parts[0] and parts[1].
radar_old = """      return (
        <>
          {parts[0]}
          <div style={{ height: '220px', width: '100%', margin: '12px 0', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                <Radar name="Skills" dataKey="A" stroke="#D9AF67" fill="#D9AF67" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {parts[1]}
        </>
      );
    }
    return content;"""

radar_new = """      return (
        <>
          <div className="markdown-body" style={{ width: '100%' }}><ReactMarkdown>{parts[0]}</ReactMarkdown></div>
          <div style={{ height: '220px', width: '100%', margin: '12px 0', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                <Radar name="Skills" dataKey="A" stroke="#D9AF67" fill="#D9AF67" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="markdown-body" style={{ width: '100%' }}><ReactMarkdown>{parts[1]}</ReactMarkdown></div>
        </>
      );
    }
    return <div className="markdown-body" style={{ width: '100%' }}><ReactMarkdown>{content}</ReactMarkdown></div>;"""

content = content.replace(radar_old, radar_new)

# Fix Input Area in CareerCopilot
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

new_input = '''<div className="p-4 border-t border-blue-50 bg-slate-100">
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2 items-center bg-white border border-slate-200 rounded-full shadow-sm p-1 pr-2">
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-slate-800 placeholder-slate-400"
                  style={{ boxShadow: 'none' }}
                  placeholder="Ask Dhruv anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center justify-center shrink-0"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>'''

content = content.replace(old_input, new_input)

with open('frontend/src/components/features/CareerCopilot.jsx', 'w') as f:
    f.write(content)


# ------------- Fix AICareerGuidance.jsx -------------
with open('frontend/src/pages/ai/AICareerGuidance.jsx', 'r') as f:
    aic_content = f.read()

# Fix form in AICareerGuidance
old_aic_input = '''<form 
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
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-slate-800 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>'''

new_aic_input = '''<form 
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
              className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center justify-center shrink-0"
              style={{ minWidth: '48px', minHeight: '48px' }}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>'''

aic_content = aic_content.replace(old_aic_input, new_aic_input)

# In AICareerGuidance.jsx, ReactMarkdown is already used but maybe we can wrap it in markdown-body
aic_content = aic_content.replace('<ReactMarkdown>{msg.content}</ReactMarkdown>', '<div className="markdown-body"><ReactMarkdown>{msg.content}</ReactMarkdown></div>')

with open('frontend/src/pages/ai/AICareerGuidance.jsx', 'w') as f:
    f.write(aic_content)

print("Done")
