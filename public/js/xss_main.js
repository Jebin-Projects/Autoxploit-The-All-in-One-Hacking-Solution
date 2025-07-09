document.addEventListener('DOMContentLoaded', () => {
    const xssscanForm = document.getElementById('xssscanForm');
    const resultsDiv = document.getElementById('results');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (xssscanForm) {
        xssscanForm.addEventListener('submit', async (e) => {
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
                    scanName: 'XSS Scan',
                    category: 'Website Exploits',
                    targetUrl: url,
                    toolUsed: 'XSS',
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

    /**
     * Toggles the loading indicator on/off.
     * @param {boolean} isLoading - Whether to show or hide the loading indicator.
     */
    function toggleLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.style.display = 'block';
            resultsDiv.innerHTML = '<p>Scanning for XSS vulnerabilities...</p>';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Gets the value of an input element by its ID.
     * @param {string} id - The ID of the input element.
     * @returns {string} - The value of the input element.
     */
    function getInputElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    /**
     * Performs the vulnerability scan by sending a request to the backend.
     * @param {string} url - The target URL.
     * @returns {Promise<Object[]>} - The scan results.
     */
    async function performVulnerabilityScan(url) {
        const response = await fetch('/api/xssscan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json(); // Parse the JSON response
    }

    /**
     * Escapes HTML characters to prevent XSS in the frontend.
     * @param {string} str - The string to escape.
     * @returns {string} - The escaped string.
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str; // Automatically escapes HTML characters
        return div.innerHTML;
    }

    /**
     * Displays the scan results in the UI.
     * @param {Object[]} results - The scan results.
     */
    function displayResults(results) {
        let output = '<h3>Scan Results:</h3><ul>';
        if (Array.isArray(results)) {
            results.forEach(result => {
                if (result.status === 'vulnerable') {
                    const escapedPayload = escapeHtml(result.payload); // Escape the payload
                    output += `<li><strong>${result.type}</strong>: Vulnerable (${escapedPayload})</li>`;
                } else if (result.status === 'not vulnerable') {
                    output += `<li><strong>${result.type}</strong>: Not vulnerable</li>`;
                } else {
                    output += `<li><strong>Error</strong>: Unexpected result</li>`;
                }
            });
        } else {
            output += `<li><strong>Error</strong>: Unexpected result</li>`;
        }
        output += '</ul>';
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