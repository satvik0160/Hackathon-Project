import re
import json
import uuid

def parse_yt(filepath):
    with open(filepath, 'r') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    resources = []
    category = "General"
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check category
        cat_match = re.match(r'^(\d+)\.\s+(.*)$', line)
        if cat_match:
            category = cat_match.group(2).title()
            i += 1
            continue
            
        # Check start of YT item
        item_match = re.match(r'^(BEGINNER|INTERMEDIATE|ADVANCED)\s+(English|Hindi)(.*)$', line)
        if item_match:
            difficulty = item_match.group(1).title()
            title = item_match.group(3).strip()
            
            # Read title continuation
            i += 1
            while i < len(lines) and not lines[i].startswith('Channel:'):
                title += " " + lines[i]
                i += 1
                
            # Read channel and URL
            if i < len(lines) and lines[i].startswith('Channel:'):
                chan_line = lines[i]
                url_match = re.search(r'(https?://.*)', chan_line)
                url = url_match.group(1) if url_match else ""
                
                # Check for URL continuation on next line
                i += 1
                while i < len(lines) and not re.match(r'^(BEGINNER|INTERMEDIATE|ADVANCED|\d+\.)', lines[i]) and 'LINK_ANNOT' not in lines[i]:
                    url += lines[i]
                    i += 1
                
                durations = {'Beginner': '120 min', 'Intermediate': '90 min', 'Advanced': '60 min'}
                
                if url:
                    resources.append({
                        'id': str(uuid.uuid4()),
                        'title': title,
                        'description': f'Video Masterclass on {category}.',
                        'resource_type': 'Video',
                        'difficulty_level': difficulty,
                        'skill_category': category,
                        'duration': durations.get(difficulty, '60 min'),
                        'url': url,
                        'completed': False
                    })
            continue
            
        i += 1
    return resources

def parse_written(filepath):
    with open(filepath, 'r') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    resources = []
    category = "General"
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check category
        cat_match = re.match(r'^(\d+)\.\s+(.*)$', line)
        if cat_match:
            category = cat_match.group(2).title()
            i += 1
            continue
            
        item_match = re.match(r'^(BEGINNER|INTERMEDIATE|ADVANCED)(W3Schools|GFG|.*)$', line)
        if item_match:
            difficulty = item_match.group(1).title()
            source = item_match.group(2)
            
            i += 1
            title = lines[i] if i < len(lines) else "Tutorial"
            
            i += 1
            url = ""
            if i < len(lines):
                url_match = re.search(r'(https?://.*)', lines[i])
                if url_match:
                    url = url_match.group(1)
            
            # Check continuation
            i += 1
            while i < len(lines) and not re.match(r'^(BEGINNER|INTERMEDIATE|ADVANCED|\d+\.)', lines[i]) and 'LINK_ANNOT' not in lines[i]:
                url += lines[i]
                i += 1
                
            durations = {'Beginner': '15 min', 'Intermediate': '30 min', 'Advanced': '45 min'}
            
            if url:
                resources.append({
                    'id': str(uuid.uuid4()),
                    'title': title,
                    'description': f'In-depth written tutorial covering {category}.',
                    'resource_type': 'Article',
                    'difficulty_level': difficulty,
                    'skill_category': category,
                    'duration': durations.get(difficulty, '30 min'),
                    'url': url,
                    'completed': False
                })
            continue
            
        i += 1
    return resources

yt_res = parse_yt('yt_curriculum.txt')
wr_res = parse_written('written_curriculum.txt')

all_resources = yt_res + wr_res
print(f"Extracted {len(yt_res)} YT resources and {len(wr_res)} Written resources. Total: {len(all_resources)}")

with open('all_resources.json', 'w') as f:
    json.dump(all_resources, f, indent=2)

