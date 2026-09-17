import re

with open('frontend/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Add useState
if 'const [activeTab, setActiveTab] = useState(\'students\');' not in content:
    content = content.replace(
        'export default function Landing() {',
        "export default function Landing() {\n  const [activeTab, setActiveTab] = useState('students');"
    )

# 2. Add "How It Works" before Feature showcase
how_it_works = """
        {/* ---------------- How It Works ---------------- */}
        <section id="how-it-works" className="landing-section bg-neutral-900/30">
          <div className="landing-container relative z-10">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <span className="landing-eyebrow">
                  <Zap className="w-3.5 h-3.5" />
                  How it works
                </span>
                <h2 className="landing-h2 mt-5">
                  Your skill journey in <span className="landing-gradient-text">three steps</span>.
                </h2>
              </div>
            </Reveal>

            <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <Reveal delay={0.1} className="relative bg-neutral-950/50 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">1. Assess & Baseline</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Take adaptive assessments to map your current skill tree. No more guessing—know exactly where you stand against industry standards.
                </p>
              </Reveal>

              <Reveal delay={0.2} className="relative bg-neutral-950/50 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">2. AI-Guided Growth</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Dhruv, your AI Career Copilot, identifies your gaps and builds a personalized daily roadmap to make you job-ready.
                </p>
              </Reveal>

              <Reveal delay={0.3} className="relative bg-neutral-950/50 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">3. Deterministic Matching</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Get matched to live industry roles based on verifiable evidence rather than keyword-stuffed resumes.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

"""
if 'id="how-it-works"' not in content:
    content = content.replace(
        '{/* ---------------- Feature showcase (zigzag) ---------------- */}',
        how_it_works + '        {/* ---------------- Feature showcase (zigzag) ---------------- */}'
    )

# 3. Add "Audience Tabs" before Final CTA
audience_tabs = """
        {/* ---------------- Audience Tabs ---------------- */}
        <section id="audience" className="landing-section">
          <div className="landing-container relative z-10">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="landing-eyebrow">
                  <Users className="w-3.5 h-3.5" />
                  Who is DevAstra for?
                </span>
                <h2 className="landing-h2 mt-5">
                  One platform. <span className="landing-gradient-text">Three perspectives.</span>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'students' ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <GraduationCap className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                  For Students
                </button>
                <button 
                  onClick={() => setActiveTab('industry')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'industry' ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Building2 className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                  For Industry
                </button>
                <button 
                  onClick={() => setActiveTab('institutions')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'institutions' ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Users className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                  For Institutions
                </button>
              </div>

              <div className="bg-neutral-950/50 border border-white/10 rounded-3xl p-8 md:p-12 min-h-[300px] flex flex-col md:flex-row items-center overflow-hidden">
                {activeTab === 'students' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 items-center w-full">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Stop applying blind.</h3>
                      <p className="text-neutral-400 leading-relaxed mb-6">
                        Build a verifiable skill profile through assessments and mock interviews. Let AI identify your weak spots and give you a clear, personalized roadmap to get hired.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" /> Prove your skills to employers instantly.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" /> Get matched to jobs you actually qualify for.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" /> AI-driven interview prep and feedback.</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl aspect-video border border-white/5 flex items-center justify-center">
                      <Target className="w-16 h-16 text-neutral-700" />
                    </div>
                  </motion.div>
                )}
                {activeTab === 'industry' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 items-center w-full">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Hire on evidence, not keywords.</h3>
                      <p className="text-neutral-400 leading-relaxed mb-6">
                        Stop filtering through thousands of identical resumes. See deterministic matching scores based on actual coding assessments and technical interviews.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-amber-500 mr-3 shrink-0" /> Real-time skill verification of candidates.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-amber-500 mr-3 shrink-0" /> Post roles and get perfectly matched shortlists.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-amber-500 mr-3 shrink-0" /> Reduce time-to-hire and interview overhead.</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl aspect-video border border-white/5 flex items-center justify-center">
                      <BarChart3 className="w-16 h-16 text-neutral-700" />
                    </div>
                  </motion.div>
                )}
                {activeTab === 'institutions' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 items-center w-full">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Fix the curriculum in real-time.</h3>
                      <p className="text-neutral-400 leading-relaxed mb-6">
                        Get aggregate analytics on your students' skill gaps compared to current industry demands. Update your syllabus before graduation, not after placement season.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" /> Macro-level student performance analytics.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" /> Live industry alignment scores.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" /> Better placement rates through early intervention.</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl aspect-video border border-white/5 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-neutral-700" />
                    </div>
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

"""

if 'id="audience"' not in content:
    content = content.replace(
        '{/* ---------------- Final CTA ---------------- */}',
        audience_tabs + '        {/* ---------------- Final CTA ---------------- */}'
    )


with open('frontend/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
