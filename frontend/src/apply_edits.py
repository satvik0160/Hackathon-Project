with open('/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/index.css', 'r') as f:
    lines = f.readlines()

def replace_lines(start, end, replacement_text):
    global lines
    start_idx = start - 1
    end_idx = end
    replacement_lines = [line + '\n' for line in replacement_text.strip('\n').split('\n')]
    lines = lines[:start_idx] + replacement_lines + lines[end_idx:]

# STEP 18
replace_lines(2075, 2389, """/* ================================================================
   EXECUTIVE DARK MODE — GLASSMORPHISM OVERRIDE
   ================================================================ */

/* Body ambient mesh */
body {
  background-image: 
    radial-gradient(at 0% 0%, rgba(217, 175, 103, 0.04) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(129, 140, 248, 0.04) 0px, transparent 50%);
  background-attachment: fixed;
  background-size: cover;
}

/* Glassmorphism Cards */
.card, .stat-card, .dashboard-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
  word-wrap: break-word;
}

.card:hover, .stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(217, 175, 103, 0.12);
}

/* Executive Gold Buttons */
.btn-primary {
  background: linear-gradient(135deg, #D9AF67, #C9A050);
  border: none;
  color: #0a0a0a;
  font-weight: 700;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(217, 175, 103, 0.25);
  letter-spacing: 0.03em;
  font-size: 0.85rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  text-transform: none;
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, #E8C882, #D9AF67);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(217, 175, 103, 0.35);
}

.btn-primary:hover::after {
  opacity: 1;
}

/* Glass Inputs */
.input, .textarea, .select {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
}

.input:focus, .textarea:focus {
  border-color: rgba(217, 175, 103, 0.5);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 4px rgba(217, 175, 103, 0.1);
  outline: none;
}

/* Typography */
h1, h2, h3 {
  letter-spacing: -0.03em;
}

h1 {
  font-weight: 800;
}

/* Glass Header */
.app-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

/* Glass Sidebar */
.app-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(16px);
}

/* Gold Active Nav */
.nav-link {
  border-radius: 12px;
  margin-bottom: 4px;
}
.nav-link.active {
  background: linear-gradient(90deg, rgba(217, 175, 103, 0.12), rgba(217, 175, 103, 0.04)) !important;
  color: #D9AF67 !important;
  box-shadow: 0 0 15px rgba(217, 175, 103, 0.1);
  border: none;
  border-left: 3px solid #D9AF67;
}
.nav-link.active .nav-link-icon {
  color: #D9AF67 !important;
  transform: scale(1.1);
}

/* Executive Badges */
.badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.03em;
  font-size: 0.7rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-transform: none;
}

/* Page Headers */
.page-header h1 {
  background: linear-gradient(135deg, #F5F5F5, #D9AF67);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  letter-spacing: -0.04em;
}

/* Skeleton Loading */
.skeleton-card {
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Page Transitions */
.page-container {
  animation: pageSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes pageSlideUp {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Overflow Fixes */
* {
  min-width: 0;
}

.card-title, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

.stat-value {
  white-space: normal !important;
  word-wrap: break-word;
  display: block;
}

.stat-card {
  min-width: 0;
  width: 100%;
  overflow: hidden !important;
  word-wrap: break-word;
  white-space: normal !important;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.stat-label {
  white-space: normal !important;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  line-height: 1.2;
}

.flex {
  min-width: 0;
}

.flex-1 {
  min-width: 0;
}

.text-truncate, .truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-wrap-fix {
  white-space: normal;
  word-break: break-word;
}

@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; }

/* Glass Form Inputs (Tailwind @apply overrides) */
.form-input, .form-select, .form-textarea {
  @apply w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all;
}

.btn-outline {
  @apply border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 font-medium px-4 py-2 rounded-xl transition-all;
}

.filter-chip {
  @apply px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-neutral-300 text-sm hover:border-amber-500/40 hover:bg-amber-500/[0.08] transition-all;
}
.filter-chip.active {
  @apply bg-amber-500 border-amber-500 text-neutral-950 shadow-[0_0_15px_rgba(217,175,103,0.3)];
}

.quiz-option {
  @apply flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-left transition-all text-neutral-300;
}
.quiz-option.selected {
  @apply border-amber-500/50 bg-amber-500/10 text-white shadow-[inset_0_0_20px_rgba(217,175,103,0.1)];
}
.quiz-option-letter {
  @apply w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] text-neutral-400 font-bold text-sm;
}
.quiz-option.selected .quiz-option-letter {
  @apply bg-amber-500 text-neutral-950 shadow-[0_0_10px_rgba(217,175,103,0.4)];
}

/* Chat Bubble Overrides */
.chat-bubble.user {
  background: linear-gradient(135deg, #D9AF67, #C9A050);
  color: #0a0a0a;
}

.chat-bubble.ai {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-avatar.user {
  background-color: #D9AF67;
  color: #0a0a0a;
}

.chat-avatar.ai {
  background-color: rgba(129, 140, 248, 0.1);
  color: #818CF8;
}

/* Gauge */
.gauge-dial {
  background-color: #0a0a0a;
  box-shadow: inset 0px 2px 10px rgba(255,255,255,0.02), 0px 4px 20px rgba(0,0,0,0.4);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* Heatmap Levels */
.heatmap-cell.level-1 { background: rgba(217, 175, 103, 0.15); }
.heatmap-cell.level-2 { background: rgba(217, 175, 103, 0.3); }
.heatmap-cell.level-3 { background: rgba(217, 175, 103, 0.5); }
.heatmap-cell.level-4 { background: #D9AF67; }

/* Roadmap Nodes */
.roadmap-node {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(8px);
}
.roadmap-node:hover { border-color: rgba(217, 175, 103, 0.3); }
.roadmap-node.active { border-color: #D9AF67; box-shadow: 0 0 0 3px rgba(217, 175, 103, 0.1); }

/* Filter Bar */
.filter-bar {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
}

/* Search Modal */
.search-modal {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Notification Panel */
.notification-panel {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Dropdown Menu */
.dropdown-menu {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

/* Spinner */
.spinner {
  border-color: rgba(255, 255, 255, 0.08);
  border-top-color: #D9AF67;
}

/* Progress Bar */
.progress-fill {
  background: linear-gradient(90deg, #D9AF67, #818CF8);
}

/* Scrollbar — Subtle */
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Selection */
::selection {
  background: rgba(217, 175, 103, 0.2);
  color: #F5F5F5;
}

/* Focus Ring */
:focus-visible {
  outline: 2px solid rgba(217, 175, 103, 0.5);
  outline-offset: 2px;
}

/* Links */
a { color: #D9AF67; }
a:hover { color: #E8C882; }

/* Onboarding */
.onboarding-page {
  background: #0a0a0a;
}
.onboarding-step.completed { background: #D9AF67; }
.onboarding-step.active {
  background: linear-gradient(90deg, #D9AF67, rgba(255,255,255,0.05));
}

/* Interview */
.interview-fullscreen {
  background: #0a0a0a;
}
.interview-header {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

/* Timeline */
.timeline-dot.active {
  background: #D9AF67;
  border-color: #D9AF67;
  box-shadow: 0 0 0 4px rgba(217, 175, 103, 0.15);
}

/* Markdown */
.markdown-body {
  color: var(--text-primary) !important;
}
.markdown-body code {
  background: rgba(255, 255, 255, 0.06);
  color: #D9AF67;
}
.markdown-body pre {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* Streak Flame */
.streak-flame {
  background: linear-gradient(135deg, rgba(217, 175, 103, 0.1), rgba(239, 68, 68, 0.08));
  border: 1px solid rgba(217, 175, 103, 0.2);
  color: #D9AF67;
}

/* Level Badge */
.level-badge {
  background: linear-gradient(135deg, #D9AF67, #818CF8);
  color: #0a0a0a;
}""")

# STEP 17: Replace .auth-logo gradient (lines 1391-1401)
replace_lines(1391, 1401, """.auth-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #D9AF67, #C9A050);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0a;
  margin: 0 auto var(--space-4);
}""")

# STEP 17: Replace .auth-card (lines 1378-1384)
replace_lines(1378, 1384, """.auth-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}""")

# STEP 17: Replace .auth-page background (lines 1363-1418 - actually just 1363-1369 maybe? Let's check wait)
# Ah wait, STEP 17 says "(lines 1363-1418)" but then breaks it down:
# Replace `.auth-page` background:

# STEP 16: Update .copilot-suggestion (lines 1215-1229)
replace_lines(1215, 1229, """.copilot-suggestion {
  padding: var(--space-1) var(--space-3);
  background: rgba(217, 175, 103, 0.08);
  border: 1px solid rgba(217, 175, 103, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copilot-suggestion:hover {
  background: var(--primary);
  color: #0a0a0a;
}""")

# STEP 15: Update .copilot-message.ai (lines 1183-1188)
replace_lines(1183, 1188, """.copilot-message.ai {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: var(--radius-sm);
}""")

# STEP 14: Update .copilot-message.user (lines 1176-1181)
replace_lines(1176, 1181, """.copilot-message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #D9AF67, #C9A050);
  color: #0a0a0a;
  border-bottom-right-radius: var(--radius-sm);
}""")

# STEP 13: Update .copilot-panel (lines 1135-1149)
replace_lines(1135, 1149, """.copilot-panel {
  position: fixed;
  bottom: calc(56px + var(--space-6) + var(--space-4));
  right: var(--space-6);
  width: 400px;
  max-height: 600px;
  background: rgba(10, 10, 10, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  z-index: var(--z-copilot);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}""")

# STEP 12: Update .copilot-trigger:hover (lines 1130-1133)
replace_lines(1130, 1133, """.copilot-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(217, 175, 103, 0.4);
}""")

# STEP 11: Update .copilot-trigger (lines 1112-1128)
replace_lines(1112, 1128, """.copilot-trigger {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #D9AF67, #C9A050);
  color: #0a0a0a;
  border: none;
  box-shadow: 0 4px 20px rgba(217, 175, 103, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-copilot);
  transition: all var(--transition-base);
}""")

# STEP 10: Update .table th (lines 893-903)
replace_lines(893, 903, """.table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid var(--border);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}""")

# STEP 9: Update .modal (lines 812-821)
replace_lines(812, 821, """.modal {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}""")

# STEP 8: Update .form-input:focus (lines 702-706)
replace_lines(702, 706, """.form-input:focus {
  outline: none;
  border-color: rgba(217, 175, 103, 0.5);
  box-shadow: 0 0 0 3px rgba(217, 175, 103, 0.1);
}""")

# STEP 7: Update .form-input (lines 690-699)
replace_lines(690, 699, """.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}""")

# STEP 6: Update .btn-primary (lines 622-630)
replace_lines(622, 630, """.btn-primary {
  background: linear-gradient(135deg, #D9AF67, #C9A050);
  color: #0a0a0a;
  font-weight: 600;
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #E8C882, #D9AF67);
  box-shadow: 0 4px 20px rgba(217, 175, 103, 0.3);
  transform: translateY(-1px);
}""")

# STEP 5: Update .card-hover:hover (lines 532-536)
replace_lines(532, 536, """.card-hover:hover {
  border-color: rgba(217, 175, 103, 0.15);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}""")

# STEP 4: Update .card class (lines 524-530)
replace_lines(524, 530, """.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-base);
}""")

# STEP 3: Rewrite body background (lines 163-171)
replace_lines(163, 171, """body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary);
  background-color: #0a0a0a;
  transition: background-color var(--transition-base), color var(--transition-base);
  overflow-x: hidden;
}""")

# STEP 2: Rewrite [data-theme="dark"] block (lines 119-148)
replace_lines(119, 148, """/* Dark theme is now the default — no separate [data-theme] needed */""")

# STEP 1: Rewrite :root variables (lines 13-117)
# Note: Prompt says "Use replace_file_content with StartLine=13, EndLine=117" and "The TargetContent should start with `/* ---- 1. Theme Variables ---- */` and end with the closing `}` of `:root`."
replace_lines(13, 117, """/* ---- 1. Theme Variables ---- */
:root {
  /* Brand — Executive Gold + Indigo */
  --primary: #D9AF67;
  --primary-hover: #C9A050;
  --primary-light: #E8C882;
  --primary-subtle: rgba(217, 175, 103, 0.08);
  --secondary: #818CF8;
  --accent: #818CF8;
  --accent-hover: #6366F1;
  --accent-subtle: rgba(129, 140, 248, 0.08);

  /* Semantic */
  --success: #10B981;
  --success-subtle: rgba(16, 185, 129, 0.12);
  --warning: #F59E0B;
  --warning-subtle: rgba(245, 158, 11, 0.12);
  --danger: #EF4444;
  --danger-subtle: rgba(239, 68, 68, 0.12);
  --info: #3B82F6;
  --info-subtle: rgba(59, 130, 246, 0.12);

  /* Surfaces — Deep Obsidian */
  --bg-primary: #0a0a0a;
  --bg-secondary: rgba(255, 255, 255, 0.03);
  --bg-tertiary: rgba(255, 255, 255, 0.05);
  --bg-elevated: rgba(255, 255, 255, 0.07);
  --bg-overlay: rgba(0, 0, 0, 0.7);

  /* Text — High contrast */
  --text-primary: #F5F5F5;
  --text-secondary: #A3A3A3;
  --text-tertiary: #737373;
  --text-inverse: #0a0a0a;
  --text-accent: var(--primary);

  /* Borders — Ultra thin glass edges */
  --border: rgba(255, 255, 255, 0.07);
  --border-hover: rgba(255, 255, 255, 0.15);
  --border-focus: var(--primary);

  /* Shadows — Deep floating */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.5);
  --shadow-xl: 0 20px 40px rgba(0,0,0,0.6);
  --shadow-glow: 0 0 20px rgba(217, 175, 103, 0.15);

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 0.9375rem;
  --text-lg: 1.0625rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Layout */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;
  --header-height: 60px;
  --content-max-width: 1400px;

  /* Z-index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-copilot: 600;
}""")

# Lastly write .auth-page replacement which I missed in script building earlier.
# Need to replace lines 1364-1371:
replace_lines(1364, 1371, """.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: #0a0a0a;
}""")

with open('/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/index.css', 'w') as f:
    f.writelines(lines)
