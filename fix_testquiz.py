import re

with open("frontend/src/pages/assessments/TestQuiz.jsx", "r") as f:
    content = f.read()

# Replace the max-w-4xl for the results container with max-w-7xl and adjust layout
# The original result layout starts with:
# <motion.div 
#   initial={{ opacity: 0, y: 20 }}
#   animate={{ opacity: 1, y: 0 }}
#   className="max-w-4xl mx-auto p-6 space-y-8"
# >

new_result_layout = """<motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">"""

content = content.replace(
    'className="max-w-4xl mx-auto p-6 space-y-8"\n      >',
    'className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"\n      >\n        <div className="lg:col-span-2 space-y-8">'
)

# Find the end of the motion.div and insert the right side content.
# Right before the last </motion.div> in the if (isCompleted && results) block
right_panel = """        </div>
        <div className="space-y-6">
          <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> What's Next?
            </h3>
            <p className="text-slate-600 text-sm mb-6">Based on your performance, here are some recommended actions to boost your skills further.</p>
            
            <div className="space-y-4">
              <button onClick={() => navigate('/roadmap')} className="w-full text-left p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Map className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Update Learning Path</h4>
                  <p className="text-xs text-slate-500">Refine your roadmap based on these results.</p>
                </div>
              </button>
              
              <button onClick={() => navigate('/arcade')} className="w-full text-left p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Code Arcade</h4>
                  <p className="text-xs text-slate-500">Practice your skills in gamified challenges.</p>
                </div>
              </button>
              
              <button onClick={() => navigate('/assessments')} className="w-full text-left p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Take Another Test</h4>
                  <p className="text-xs text-slate-500">Validate more skills to earn XP.</p>
                </div>
              </button>
            </div>
          </div>
        </div>"""

# Replace the closing of the motion.div
# Look for:
#        <div className="flex justify-center gap-4 mt-8">
#          <button onClick={() => navigate('/assessments')} className="btn btn-outline py-3 px-6">Back to Tests</button>
#          <button onClick={() => navigate('/roadmap')} className="btn btn-primary py-3 px-6">View Learning Path</button>
#        </div>
#      </motion.div>

content = content.replace(
    """        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => navigate('/assessments')} className="btn btn-outline py-3 px-6">Back to Tests</button>
          <button onClick={() => navigate('/roadmap')} className="btn btn-primary py-3 px-6">View Learning Path</button>
        </div>
      </motion.div>""",
    f"""        <div className="flex justify-center gap-4 mt-8">
          <button onClick={{() => navigate('/assessments')}} className="btn btn-outline py-3 px-6">Back to Tests</button>
          <button onClick={{() => navigate('/roadmap')}} className="btn btn-primary py-3 px-6">View Learning Path</button>
        </div>\n{right_panel}\n      </motion.div>"""
)

with open("frontend/src/pages/assessments/TestQuiz.jsx", "w") as f:
    f.write(content)

