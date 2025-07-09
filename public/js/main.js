document.addEventListener('DOMContentLoaded', async () => {
    console.log("JavaScript loaded and DOM content is ready");

    const vulnscanForm = document.getElementById('vulnscanForm');
    const resultsDiv = document.getElementById('results');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (!vulnscanForm || !resultsDiv || !loadingIndicator) {
        console.error('One or more required elements are missing in the DOM.');
        return;
    }

    vulnscanForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page refresh

        console.log("Form submitted");
        toggleLoading(true);

        try {
            const url = getInputElementValue('url');
            const categoryId = 1; // Predefined category ID for SQL Injection

            if (!url) {
                throw new Error('Please enter a valid URL.');
            }

            // Perform the scan
            const scanResults = await performVulnerabilityScan(url);
            const payloadInfo = await fetchPayloadInfo();

            displayResults(scanResults, payloadInfo);

            // Prepare and save scan
            const scanData = {
                scanName: 'SQL Injection Scan',
                category: 'SQL Injection',
                targetUrl: url,
                toolUsed: 'SQLi',
                isVulnerable: scanResults.some(r => r.status === 'vulnerable'),
                scanResults: JSON.stringify(scanResults),
                categoryId: categoryId
            };

            await saveScanResults(scanData);
            console.log('Scan completed and saved.');
        } catch (error) {
            console.error('Error during scan:', error.message);
            resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        } finally {
            toggleLoading(false);
        }
    });

    // ----- Helpers -----
    function toggleLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.style.display = 'block';
            resultsDiv.innerHTML = '<p>Scanning for SQL Injection vulnerabilities...</p>';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    function getInputElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    async function performVulnerabilityScan(url) {
        const response = await fetch('/api/sqliscan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    }

    async function fetchPayloadInfo() {
        const response = await fetch('/payload_info.json');
        if (!response.ok) {
            throw new Error('Failed to fetch payload information.');
        }
        return await response.json();
    }

    function displayResults(results, payloadInfo) {
        let output = '<h3>Scan Results:</h3><ul class="results-list">';
        if (Array.isArray(results)) {
            results.forEach(result => {
                const info = payloadInfo[result.payload] || {};
                if (result.status === 'vulnerable') {
                    output += `
                    <li class="result-item vulnerable">
                        <strong>SQL Injection</strong>: Vulnerable <br>
                        <span>Payload: ${result.payload}</span> <br>
                        <span>URL: ${result.url}</span> <br>
                        <span>Method: ${result.method || 'N/A'}</span> <br>
                        <span>Parameter: ${result.parameter || 'N/A'}</span> <br>
                        <span>Description: ${info.description || 'N/A'}</span> <br>
                        <span>Risk: ${info.risk_description || 'N/A'}</span> <br>
                        <span>Recommendation: ${info.recommendation || 'N/A'}</span>
                    </li>`;
                } else if (result.status === 'not vulnerable') {
                    output += `<li class="result-item not-vulnerable"><strong>SQL Injection</strong>: Not vulnerable</li>`;
                } else {
                    output += `<li class="result-item error"><strong>Error</strong>: Unexpected result</li>`;
                }
            });
        } else {
            output += `<li class="result-item error"><strong>Error</strong>: Unexpected result</li>`;
        }
        output += '</ul>';
        resultsDiv.innerHTML = output;
    }

    async function saveScanResults(scanData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in.');
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch('/api/scan-results/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(scanData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save scan results.');
            }

            console.log('Scan results saved successfully:', result);
        } catch (error) {
            console.error('Error saving scan results:', error);
            alert('An error occurred while saving scan results.');
        }
    }
});
