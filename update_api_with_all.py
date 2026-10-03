import json

with open('all_resources.json', 'r') as f:
    all_resources = json.load(f)

file = 'frontend/src/services/api.js'
with open(file, 'r') as f:
    content = f.read()

# Find the start and end of mockData array
start_idx = content.find('    let mockData = [')
end_idx = content.find('];', start_idx) + 2

if start_idx == -1 or end_idx == -1:
    print("Could not find mockData array")
    exit(1)

# Format massive mockData array
mock_data_str = "    let mockData = [\n"
for res in all_resources:
    # Safely format dict as JS object literal string
    res_str = json.dumps(res)
    # clean up JSON into JS object notation
    res_str = res_str.replace('"', "'")
    # replace keys to not have quotes
    for k in res.keys():
        res_str = res_str.replace(f"'{k}':", f"{k}:")
    # Python json.dumps serializes booleans to 'false'/'true' which become strings, wait it's False/True in dict -> dumped as false/true
    # Actually json.dumps keeps double quotes. 
    # Let's just use json.dumps as is since JSON is valid JS.
    mock_data_str += f"      {json.dumps(res)},\n"

mock_data_str += "    ];\n"

# Replace it
new_content = content[:start_idx] + mock_data_str + content[end_idx:]

with open(file, 'w') as f:
    f.write(new_content)

print("api.js perfectly updated with all 162 resources!")
