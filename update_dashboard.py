import re

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'r') as f:
    content = f.read()

# Add import for dashboardService
if 'dashboardService' not in content:
    content = content.replace("import { useAuth } from '../../contexts/AuthContext';", "import { useAuth } from '../../contexts/AuthContext';\nimport { dashboardService } from '../../services/dashboard.service';")

# Add states for dashboard data
state_injection = """
  const [dashboardData, setDashboardData] = useState({ readiness: 0, activityMap: {}, dailyTargets: [] });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.id) {
      dashboardService.getDashboardData(user.id).then(data => {
        setDashboardData(data);
        setLoadingData(false);
      });
    }
  }, [user]);
"""

if 'dashboardData' not in content:
    content = content.replace("const [readinessVal, setReadinessVal] = useState(0);", "const [readinessVal, setReadinessVal] = useState(0);" + state_injection)

# Modify readiness gauge logic
readiness_effect = """
  useEffect(() => {
    if (loadingData) return;
    const targetVal = dashboardData.readiness || 0;
    if (targetVal === 0) {
      setReadinessVal(0);
      return;
    }
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        if (current >= targetVal) {
          setReadinessVal(targetVal);
          clearInterval(interval);
          return;
        }
        current += Math.max(1, Math.floor(targetVal / 30));
        setReadinessVal(current);
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [dashboardData.readiness, loadingData]);
"""
content = re.sub(r'  // Animate gauge on mount.*?\[\]\);', readiness_effect, content, flags=re.DOTALL)

# Modify Daily Planner rendering
daily_planner_regex = r'\{\[\s*\{\s*time.*?\]\.map\(\(task, i\) => \('
daily_planner_replacement = """{dashboardData.dailyTargets.map((task, i) => ("""
if '{dashboardData.dailyTargets.map(' not in content:
    content = re.sub(r'\{\[\s*\{\s*time:.*?\]\.map\(\(task, i\) => \(', daily_planner_replacement, content, flags=re.DOTALL)

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'w') as f:
    f.write(content)
