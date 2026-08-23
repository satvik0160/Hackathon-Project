import { format } from 'date-fns';

/**
 * Format date string using date-fns
 * @param {string|Date} dateString 
 * @returns {string} Formatted date (e.g. Aug 23, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return format(date, 'MMM dd, yyyy');
};

/**
 * Format seconds into MM:SS format
 * @param {number} seconds 
 * @returns {string} Formatted time
 */
export const formatTime = (seconds) => {
  if (seconds === undefined || seconds === null) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get time-based greeting with emoji
 * @returns {string} Greeting message
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅 Good morning';
  if (hour < 18) return '☀️ Good afternoon';
  return '🌙 Good evening';
};

/**
 * Calculate user level based on XP
 * @param {number} xp 
 * @returns {Object} Level details
 */
export const calculateLevel = (xp) => {
  const baseXP = 100;
  let level = 1;
  let threshold = baseXP;
  
  while (xp >= threshold) {
    level++;
    threshold = baseXP * Math.pow(1.5, level - 1);
  }
  
  const prevThreshold = level === 1 ? 0 : baseXP * Math.pow(1.5, level - 2);
  const progress = ((xp - prevThreshold) / (threshold - prevThreshold)) * 100;
  
  let name = 'Novice';
  if (level >= 5) name = 'Apprentice';
  if (level >= 10) name = 'Adept';
  if (level >= 20) name = 'Expert';
  if (level >= 50) name = 'Master';
  
  return {
    level,
    name,
    progress: Math.min(Math.max(progress, 0), 100),
    nextThreshold: Math.floor(threshold),
    currentXP: xp
  };
};

/**
 * Get CSS color class based on skill score
 * @param {number} score (0-100)
 * @returns {string} CSS class name
 */
export const getSkillColor = (score) => {
  if (score < 30) return 'text-danger';
  if (score < 60) return 'text-warning';
  if (score < 80) return 'text-info';
  return 'text-success';
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce a function call
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};
