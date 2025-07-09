import sys
import requests
from bs4 import BeautifulSoup
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')  # Only show essential logs
logger = logging.getLogger()

# Session setup
session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
session.headers["Cookie"] = "PHPSESSID=34b5af50db2e943348f0581af7f98498"  # Replace with your session ID

def get_forms(url):
    """Extract all forms from the given URL."""
    try:
        response = session.get(url)
        response.raise_for_status()

        # Clean the HTML response by removing PHP warnings
        html_content = response.text
        if "Warning:" in html_content:
            html_content = html_content.split("<!DOCTYPE")[1]  # Remove everything before <!DOCTYPE
            html_content = "<!DOCTYPE" + html_content

        logger.info(f"HTML content received: {html_content[:1000]}")  # Log first 1000 characters
        soup = BeautifulSoup(html_content, 'html.parser')
        forms = soup.find_all("form")
        logger.info(f"Found {len(forms)} forms on the page.")
        return forms
    except Exception as e:
        logger.error(f"Error fetching forms from {url}: {e}")
        return []

def form_details(form):
    """Extract details of a form."""
    details = {}
    try:
        action = form.attrs.get("action", "#").lower()  # Default to "#" if action is missing
        method = form.attrs.get("method", "get").lower()
        inputs = [{"type": input_tag.attrs.get("type", "text"), 
                   "name": input_tag.attrs.get("name"), 
                   "value": input_tag.attrs.get("value", "")} 
                  for input_tag in form.find_all("input")]
        csrf_tokens = [input_tag for input_tag in inputs if input_tag["name"] in ["csrf_token", "token"]]
        details["action"] = action
        details["method"] = method
        details["inputs"] = inputs
        details["has_csrf_token"] = len(csrf_tokens) > 0
    except Exception as e:
        logger.error(f"Error extracting form details: {e}")
        details["action"] = "#"  # Default to "#" if an error occurs
        details["method"] = "get"
        details["inputs"] = []
        details["has_csrf_token"] = False
    return details

def csrf_scan(url):
    """Scan the given URL for CSRF vulnerabilities."""
    found_vulnerabilities = []
    try:
        response = session.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Check for forms
        forms = soup.find_all("form")
        if forms:
            for form in forms:
                details = form_details(form)
                if not details["has_csrf_token"]:
                    found_vulnerabilities.append({
                        "status": "vulnerable",
                        "form_action": details["action"],
                        "form_method": details["method"],
                        "reason": "Missing anti-CSRF token"
                    })
                else:
                    found_vulnerabilities.append({
                        "status": "not vulnerable",
                        "form_action": details["action"],
                        "form_method": details["method"],
                        "reason": "Anti-CSRF token present"
                    })

        # Check for standalone input fields
        inputs = soup.find_all("input")
        if inputs and not forms:
            found_vulnerabilities.append({
                "status": "vulnerable",
                "form_action": "#",
                "form_method": "N/A",
                "reason": "Standalone input fields detected without a form"
            })

        # If no forms or inputs are found
        if not forms and not inputs:
            found_vulnerabilities.append({
                "status": "not vulnerable",
                "form_action": "#",
                "form_method": "N/A",
                "reason": "No forms or input fields found"
            })

    except Exception as e:
        logger.error(f"Error scanning {url}: {e}")
        found_vulnerabilities.append({
            "status": "error",
            "form_action": "#",
            "form_method": "N/A",
            "reason": str(e)
        })

    return found_vulnerabilities

if __name__ == "__main__":
    try:
        base_url = sys.argv[1]
        result = csrf_scan(base_url)
        # Clean output, only showing status and payload
        clean_result = [{"status": vuln["status"], "form_action": vuln["form_action"], 
                         "form_method": vuln["form_method"], "reason": vuln["reason"]} 
                        for vuln in result]
        # Show final result as JSON
        print(json.dumps(clean_result, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))