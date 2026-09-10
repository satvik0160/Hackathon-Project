import sys
with open('frontend/src/index.css', 'r') as f:
    content = f.read()

content = content.replace('''/* 1. Theme Tokens */
:root {
  /* Light Theme */
  --bg-page: #F6F8FC;
  --bg-sidebar: #FFFFFF;
  --surface-1: #FFFFFF;
  --surface-2: #F9FBFF;
  --surface-ai: #F0ECFF;
  --surface-mission: #FFF6F1;
  --border: #E2E8F0;
  --border-strong: #CBD5E1;
  --text-main: #111827;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --primary: #2563EB;''', '''/* 1. Theme Tokens */
:root {
  /* Light Theme */
  --bg-page: #F6F8FC;
  --bg-sidebar: #FFFFFF;
  --surface-1: #FFFFFF;
  --surface-2: #F9FBFF;
  --surface-3: #F0F4F8;
  --surface-ai: #F0ECFF;
  --surface-mission: #FFF6F1;
  --border: #E2E8F0;
  --border-strong: #CBD5E1;
  --text-main: #111827;
  --text-primary: #111827;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --primary: #2563EB;''')

content = content.replace('''[data-theme="dark"] {
  /* Dark Theme */
  --bg-page: #080B14;
  --bg-sidebar: #0D1220;
  --surface-1: #111827;
  --surface-2: #172033;
  --surface-ai: #211B46;
  --surface-mission: #2A1A18;
  --border: #25324A;
  --border-strong: #435579;
  --text-main: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #8290A8;
  --primary: #3B82F6;''', '''[data-theme="dark"] {
  /* Dark Theme */
  --bg-page: #080B14;
  --bg-sidebar: #0D1220;
  --surface-1: #111827;
  --surface-2: #172033;
  --surface-3: #1E293B;
  --surface-ai: #211B46;
  --surface-mission: #2A1A18;
  --border: #25324A;
  --border-strong: #435579;
  --text-main: #F8FAFC;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;
  --primary: #3B82F6;''')

content = content.replace('''@media (max-width: 1024px) {
  :root {
    --sidebar-width: 80px;
  }
  .page-container {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  :root {
    --sidebar-width: 0px;
    --topbar-height: 56px;
  }
  .page-container {
    padding: 16px;
  }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
}''', '''@media (max-width: 900px) {
  :root {
    --sidebar-width: 0px;
    --topbar-height: 60px;
  }
  .page-container {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  :root {
    --topbar-height: 56px;
  }
  .page-container {
    padding: 16px;
  }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
}''')

with open('frontend/src/index.css', 'w') as f:
    f.write(content)
print("CSS variables and breakpoints updated")
