// Function to save scan results
async function saveScanResults(scanData) {
    try {
        const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage
        if (!token) {
            alert('You are not logged in.');
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        const response = await fetch('/api/scan-results/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token // Include the JWT token for authentication
            },
            body: JSON.stringify(scanData) // Send scan data as JSON
        });

        const result = await response.json();

        if (response.ok) {
            alert('Scan results saved successfully!');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error saving scan results:', error);
        alert('An error occurred while saving scan results.');
    }
}

// Example usage: Call this function after performing a scan
document.getElementById('performScanButton').addEventListener('click', async () => {
    const scanData = {
        scanName: 'SQL Injection Scan',
        category: 'Website Exploits',
        targetUrl: document.getElementById('targetUrl').value,
        toolUsed: 'SQLi',
        isVulnerable: true,
        scanResults: '{"vulnerability": "SQL Injection", "severity": "High"}'
    };

    await saveScanResults(scanData);
});