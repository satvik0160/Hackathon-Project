import sys

with open('frontend/src/components/layout/Layout.jsx', 'r') as f:
    content = f.read()

content = content.replace(
'''  return (
    <div className="min-h-screen flex overflow-hidden antialiased tracking-tight" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col relative z-10 w-full h-screen overflow-hidden md:ml-[var(--sidebar-width,216px)]"
      >
        {/* Top Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <div className="w-full mx-auto px-4 md:px-[32px] sm:px-[20px] py-6" style={{ maxWidth: 'var(--content-max-width, 1200px)' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );''',
'''  return (
    <div className="min-h-[100dvh] flex antialiased tracking-tight" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}>
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col relative z-10 min-w-0 min-h-[100dvh] transition-all duration-300 ease-in-out"
        style={{ marginLeft: 'var(--sidebar-width, 216px)' }}
      >
        {/* Top Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <div className="w-full mx-auto px-4 md:px-8 py-6" style={{ maxWidth: 'var(--content-max-width, 1440px)' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );'''
)

with open('frontend/src/components/layout/Layout.jsx', 'w') as f:
    f.write(content)
print("Layout.jsx updated")
