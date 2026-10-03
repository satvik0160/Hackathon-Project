file = 'frontend/src/services/api.js'
with open(file, 'r') as f:
    content = f.read()

# We need to replace the entire getResources block
# Let's find the start and end of getResources
import re

start_idx = content.find('  getResources: async (filters) => {')
# find the next function start '  getPaths: async () => {'
end_idx = content.find('  getPaths: async () => {')

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    exit(1)

new_func = """  getResources: async (filters) => {
    let mockData = [
      // YouTube Video Curriculum
      { id: 'yt-1', title: 'Django Web Framework - Full Course', description: 'Beginner-friendly full course on Python Django by freeCodeCamp.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'Python', duration: '60 min', url: 'https://www.youtube.com/watch?v=F5mRW0jo-U4', completed: false },
      { id: 'yt-2', title: 'Django Complete Playlist (100 Days)', description: 'Master Django with this complete 100 days playlist by CodeWithHarry.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'Python', duration: '120 min', url: 'https://www.youtube.com/playlist?list=PLu0W_9lII9ah7DDtYtflgwMwpT3xmjXY9', completed: false },
      { id: 'yt-3', title: 'SQL and Databases - Full Course', description: 'Learn SQL and Databases from scratch with Mike Dane.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'Database', duration: '240 min', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', completed: false },
      { id: 'yt-4', title: 'Complete SQL Tutorial in One Shot', description: 'One-shot comprehensive SQL tutorial by Apna College.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'Database', duration: '45 min', url: 'https://www.youtube.com/watch?v=hlGoQC332VM', completed: false },
      // Written Curriculum (GFG/W3S)
      { id: 'wrt-1', title: 'Django Introduction & Basic Syntax', description: 'Get started with Django routing, views, and basics on W3Schools.', resource_type: 'Article', difficulty_level: 'Beginner', skill_category: 'Python', duration: '15 min', url: 'https://www.w3schools.com/django/', completed: false },
      { id: 'wrt-2', title: 'Django Tutorial - Models, Views & Routing', description: 'Deep dive into Django architecture and models on GeeksforGeeks.', resource_type: 'Article', difficulty_level: 'Intermediate', skill_category: 'Python', duration: '30 min', url: 'https://www.geeksforgeeks.org/django-tutorial/', completed: false },
      { id: 'wrt-3', title: 'SQL Tutorial - Interactive Querying', description: 'Learn SQL CRUD commands interactively.', resource_type: 'Article', difficulty_level: 'Beginner', skill_category: 'Database', duration: '20 min', url: 'https://www.w3schools.com/sql/', completed: false },
      { id: 'wrt-4', title: 'Advanced SQL: Window Functions & Indexing', description: 'Master advanced SQL querying and database optimization.', resource_type: 'Article', difficulty_level: 'Advanced', skill_category: 'Database', duration: '40 min', url: 'https://www.geeksforgeeks.org/sql/sql-advanced-functions/', completed: false },
      // Original Mock Data
      { id: 'lr-1', title: 'Introduction to React', description: 'Learn React fundamentals including components, hooks, and state management.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'React', duration: '45 min', url: 'https://react.dev/learn', completed: false },
      { id: 'lr-2', title: 'Python for Data Science', description: 'Master Python basics for data analysis and machine learning applications.', resource_type: 'Course', difficulty_level: 'Beginner', skill_category: 'Python', duration: '120 min', url: 'https://docs.python.org/3/tutorial/', completed: false },
      { id: 'lr-3', title: 'System Design Primer', description: 'Learn how to design large-scale distributed systems step by step.', resource_type: 'Article', difficulty_level: 'Advanced', skill_category: 'System Design', duration: '30 min', url: 'https://github.com/donnemartin/system-design-primer', completed: false },
      { id: 'lr-4', title: 'Node.js Best Practices', description: 'Production-grade Node.js patterns and security guidelines.', resource_type: 'Article', difficulty_level: 'Intermediate', skill_category: 'Node.js', duration: '20 min', url: 'https://nodejs.org/en/docs/guides', completed: false },
      { id: 'lr-5', title: 'AWS Cloud Fundamentals', description: 'Get started with AWS services: EC2, S3, Lambda, and more.', resource_type: 'Video', difficulty_level: 'Beginner', skill_category: 'Cloud Computing', duration: '60 min', url: 'https://aws.amazon.com/getting-started/', completed: false },
      { id: 'lr-6', title: 'Data Structures & Algorithms', description: 'Comprehensive guide to DSA with practice problems.', resource_type: 'Course', difficulty_level: 'Intermediate', skill_category: 'Data Structures', duration: '180 min', url: 'https://leetcode.com/explore/', completed: false },
    ];

    try {
      let query = insforge.from('learning_resources').select('*');
      if (filters?.resource_type) query = query.eq('resource_type', filters.resource_type);
      if (filters?.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
      const { data, error } = await query;
      if (error) throw error;
      
      // Combine DB and mock, then apply filters manually to mock to ensure search/sort works perfectly
      let combined = [...(data || []), ...mockData];
      
      // Apply filters locally for our mock data
      if (filters?.resource_type) combined = combined.filter(r => r.resource_type === filters.resource_type);
      if (filters?.difficulty_level) combined = combined.filter(r => r.difficulty_level === filters.difficulty_level);
      
      return { data: combined };
    } catch {
      // Offline fallback
      let combined = [...mockData];
      if (filters?.resource_type) combined = combined.filter(r => r.resource_type === filters.resource_type);
      if (filters?.difficulty_level) combined = combined.filter(r => r.difficulty_level === filters.difficulty_level);
      return { data: combined };
    }
  },
"""

content = content[:start_idx] + new_func + content[end_idx:]

with open(file, 'w') as f:
    f.write(content)

print("api.js perfectly rewritten for curriculum extraction and filtering!")
