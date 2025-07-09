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
session.headers["Cookie"] = "security=low; PHPSESSID=34b5af50db2e943348f0581af7f98498"  # Replace with your session ID

# Default test files
test_files = [
    {"name": "test.php", "content": "<?php echo 'Vulnerable to RCE'; ?>"},
    {"name": "test.exe", "content": "MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF"},  # Dummy EXE header
    {"name": "test.jpg", "content": "\xFF\xD8\xFF\xE0\x00\x10\x4A\x46\x49\x46\x00\x01"},  # Dummy JPG header
]

def upload_file(url, file_name, file_content):
    """Upload a test file to the target URL."""
    try:
        files = {"uploaded": (file_name, file_content)}
        response = session.post(url, data={"Upload": "Upload"}, files=files)
        logger.info(f"Uploaded {file_name} to {url}, Response: {response.status_code}")
        logger.info(f"Response Content: {response.text[:500]}")  # Log first 500 characters

        # Parse the HTML response for success messages
        soup = BeautifulSoup(response.text, 'html.parser')
        pre_tags = soup.find_all("pre")  # Find all <pre> tags
        for pre in pre_tags:
            if "succesfully uploaded!" in pre.text:
                logger.info("File upload successful.")
                return response
            elif "Your image was not uploaded." in pre.text:
                logger.error("File upload failed: Backend rejected the file.")
                return None

        # If no success or failure message is found
        logger.error("File upload failed: No relevant message found in response.")
        return None
    except Exception as e:
        logger.error(f"Error uploading {file_name}: {e}")
        return None

def check_file_access(base_url, file_name):
    """Check if the uploaded file is accessible."""
    try:
        file_url = f"{base_url.rstrip('/')}/{file_name}"  # Remove trailing slashes
        logger.info(f"Checking file access: {file_url}")
        response = session.get(file_url)
        logger.info(f"Response: {response.status_code}")
        logger.info(f"Response Content: {response.text[:500]}")  # Log first 500 characters
        return response
    except Exception as e:
        logger.error(f"Error accessing {file_name}: {e}")
        return None

def file_upload_scan(url, base_url):
    """Scan the given URL for file upload vulnerabilities."""
    found_vulnerabilities = []
    for test_file in test_files:
        file_name = test_file["name"]
        file_content = test_file["content"]

        # Step 1: Upload the file
        upload_response = upload_file(url, file_name, file_content)
        if not upload_response:
            found_vulnerabilities.append({
                "status": "error",
                "file_name": file_name,
                "reason": "File upload failed. Backend rejected the file."
            })
            continue

        # Step 2: Check if the file is accessible
        access_response = check_file_access(base_url, file_name)
        if access_response and access_response.status_code == 200:
            found_vulnerabilities.append({
                "status": "vulnerable",
                "file_name": file_name,
                "reason": "Uploaded file is accessible and may be executed"
            })
        elif access_response and access_response.status_code == 404:
            found_vulnerabilities.append({
                "status": "not vulnerable",
                "file_name": file_name,
                "reason": "Uploaded file is not accessible (404 Not Found)"
            })
        else:
            found_vulnerabilities.append({
                "status": "error",
                "file_name": file_name,
                "reason": f"Failed to check file access. Response: {access_response.text[:100] if access_response else 'No response'}"
            })

    return found_vulnerabilities if found_vulnerabilities else [{"status": "not vulnerable", "file_name": "N/A", "reason": "No files tested"}]

if __name__ == "__main__":
    try:
        upload_url = sys.argv[1]  # URL for file upload endpoint
        base_url = sys.argv[2]    # Base URL to check uploaded files
        result = file_upload_scan(upload_url, base_url)
        print(json.dumps(result, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))