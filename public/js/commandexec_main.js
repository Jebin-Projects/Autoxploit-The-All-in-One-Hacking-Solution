document.addEventListener('DOMContentLoaded', () => {
    const commandexecForm = document.getElementById('commandexecForm');
    const resultsDiv = document.getElementById('results');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (commandexecForm) {
        commandexecForm.addEventListener('submit', async (e) => {
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
            resultsDiv.innerHTML = '<p>Scanning for Command Execution vulnerabilities...</p>';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    function getInputElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    async function performVulnerabilityScan(url) {
        const response = await fetch('/api/commandexec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json(); // Parse the JSON response
    }

    function displayResults(results) {
        let output = '<h3>Scan Results:</h3><ul>';
        if (Array.isArray(results)) {
            results.forEach(result => {
                if (result.status === 'vulnerable') {
                    output += `<li><strong>${result.type}</strong>: Vulnerable (${result.payload})</li>`;
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
});