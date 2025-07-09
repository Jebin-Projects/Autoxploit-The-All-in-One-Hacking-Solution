document.addEventListener('DOMContentLoaded', () => {
    const csrfscanForm = document.getElementById('csrfscanForm');
    const resultsDiv = document.getElementById('results');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (csrfscanForm) {
        csrfscanForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission

            // Clear previous results
            resultsDiv.innerHTML = '';
            toggleLoading(true);

            try {
                // Get form inputs
                const url = getInputElementValue('url');

                // Validate required fields
                if (!url) {
                    throw new Error('URL is required.');
                }

                // Perform the vulnerability scan
                const result = await performVulnerabilityScan(url);

                // Display the results
                displayResults(result);

                // Save the scan results to the database
                await saveScanResults({
                    scanName: 'CSRF Scan',
                    category: 'Website Exploits',
                    targetUrl: url,
                    toolUsed: 'CSRF',
                    isVulnerable: result.some(r => r.status === 'vulnerable'), // Check if any result is vulnerable
                    scanResults: JSON.stringify(result) // Store raw scan results as JSON
                });

            } catch (error) {
                // Handle errors
                resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            } finally {
                // Hide the loading indicator
                toggleLoading(false);
            }
        });
    }

    function toggleLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.style.display = 'block';
            resultsDiv.innerHTML = '<p>Scanning for CSRF vulnerabilities...</p>';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    function getInputElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    async function performVulnerabilityScan(url) {
        const response = await fetch('/api/csrfscan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server error:", errorData);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json(); // Parse the JSON response
    }

    function displayResults(results) {
        let output = '<h3>Scan Results:</h3>';
        if (Array.isArray(results) && results.length > 0) {
            output += `
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Form Action</th>
                            <th>Form Method</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            results.forEach(result => {
                output += `
                    <tr>
                        <td>${result.status}</td>
                        <td>${result.form_action}</td>
                        <td>${result.form_method}</td>
                        <td>${result.reason}</td>
                    </tr>
                `;
            });
            output += '</tbody></table>';
        } else {
            output += '<p>No forms found or no vulnerabilities detected.</p>';
        }
        resultsDiv.innerHTML = output;
    }

    /**
     * Saves scan results to the database.
     * @param {Object} scanData - The scan data to save.
     */
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