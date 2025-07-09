document.addEventListener('DOMContentLoaded', () => {
    const fileuploadForm = document.getElementById('fileuploadForm');
    const resultsDiv = document.getElementById('results');
    const loadingIndicator = document.getElementById('loadingIndicator');

    if (fileuploadForm) {
        fileuploadForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission

            // Clear previous results
            resultsDiv.innerHTML = '';
            toggleLoading(true);

            try {
                // Get form inputs
                const uploadUrl = getInputElementValue('uploadUrl');
                const baseUrl = getInputElementValue('baseUrl');

                // Validate required fields
                if (!uploadUrl || !baseUrl) {
                    throw new Error('Both uploadUrl and baseUrl are required.');
                }

                // Retrieve JWT token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('You are not logged in.');
                }

                // Perform the vulnerability scan
                const response = await fetch('/api/fileuploadscan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token // Include the JWT token for authentication
                    },
                    body: JSON.stringify({ uploadUrl, baseUrl }), // Send data as JSON
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to perform vulnerability scan.');
                }

                const result = await response.json();

                // Display results
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
            resultsDiv.innerHTML = '<p>Scanning for file upload vulnerabilities...</p>';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    function getInputElementValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    function displayResults(results) {
        let output = '<h3>Scan Results:</h3>';
        if (Array.isArray(results) && results.length > 0) {
            output += `
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>File Name</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            results.forEach(result => {
                output += `
                    <tr>
                        <td>${result.status}</td>
                        <td>${result.file_name}</td>
                        <td>${result.reason}</td>
                    </tr>
                `;
            });
            output += '</tbody></table>';
        } else {
            output += '<p>No vulnerabilities detected.</p>';
        }
        resultsDiv.innerHTML = output;
    }
});