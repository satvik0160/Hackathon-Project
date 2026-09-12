export const TRACKING_KEY = 'devastra_activity_time';
export const THRESHOLD_MINUTES = 20;

/**
 * Gets the stored time data
 */
export const getTimeData = () => {
  try {
    const data = localStorage.getItem(TRACKING_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

/**
 * Records time spent today
 * @param {number} seconds - seconds to add
 */
export const addTime = (seconds) => {
  const data = getTimeData();
  const today = new Date().toISOString().split('T')[0];
  
  if (!data[today]) {
    data[today] = 0;
  }
  data[today] += seconds;
  
  localStorage.setItem(TRACKING_KEY, JSON.stringify(data));
  return data;
};

/**
 * Checks if a specific date met the active threshold (20 mins = 1200 seconds)
 * @param {string} dateString - YYYY-MM-DD
 */
export const isDateActive = (dateString) => {
  const data = getTimeData();
  const seconds = data[dateString] || 0;
  return seconds >= (THRESHOLD_MINUTES * 60);
};

/**
 * Get intensity level 0-3 based on time spent
 */
export const getIntensity = (dateString) => {
  const data = getTimeData();
  const seconds = data[dateString] || 0;
  const minutes = seconds / 60;
  
  if (minutes >= THRESHOLD_MINUTES) return 3; // Fully active (e.g., 20+ mins)
  if (minutes >= THRESHOLD_MINUTES / 2) return 2; // Halfway (e.g., 10+ mins)
  if (minutes > 0) return 1; // Some activity (e.g., > 0 mins)
  return 0; // No activity
};
