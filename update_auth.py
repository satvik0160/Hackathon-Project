import sys

with open('frontend/src/pages/auth/AuthContainer.jsx', 'r') as f:
    content = f.read()

# Replace root classes
content = content.replace(
    'className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] font-sans"',
    'className="min-h-[100dvh] w-full flex flex-col lg:flex-row relative overflow-y-auto overflow-x-hidden bg-[var(--bg-page)] text-[var(--text-main)] font-sans"'
)

# Left panel
content = content.replace(
    'className="hidden md:flex flex-col relative w-1/2 min-h-screen overflow-hidden"',
    'className="hidden lg:flex flex-col relative w-5/12 min-h-[100dvh] overflow-hidden"'
)
content = content.replace(
    "background: 'var(--bg-page)',",
    "background: '#080B14',"
)

# Right panel
content = content.replace(
    'className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative z-20"',
    'className="w-full lg:w-7/12 min-h-[100dvh] flex flex-col items-center justify-center p-6 sm:p-12 relative z-20"'
)

# Form container max-width
content = content.replace(
    'className="w-full max-w-[420px] p-8"',
    'className="w-full max-w-[480px] p-8 sm:p-10"'
)

# Form absolute positioning removal
content = content.replace(
    '''          {/* Form Render */}
          <div className="relative min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>''',
    '''          {/* Form Render */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>'''
)

with open('frontend/src/pages/auth/AuthContainer.jsx', 'w') as f:
    f.write(content)
print("AuthContainer.jsx updated")
