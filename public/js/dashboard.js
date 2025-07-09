// Show loading spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

// Hide loading spinner
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Function to fetch all scans for the current user
async function fetchAllScans() {
    try {
        // Show the loading spinner
        showLoadingSpinner();

        const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage
        if (!token) {
            alert('You are not logged in.');
            window.location.href = '/login.html'; // Redirect to login page
            return;
        }

        // Fetch scans from the backend
        const response = await fetch('/api/scan-results/all', {
            method: 'GET',
            headers: {
                'Authorization': token // Include the JWT token for authentication
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayScans(data.scans); // Display scans in the UI
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error fetching scans:', error);
        alert('An error occurred while fetching scans.');
    } finally {
        // Ensure the spinner is hidden
        hideLoadingSpinner();
    }
}

// Function to display scans in the UI
function displayScans(scans) {
    const tbody = document.querySelector('#scansTable tbody');
    tbody.innerHTML = ''; // Clear existing rows

    if (!scans || scans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No scans found.</td></tr>';
        return;
    }

    scans.forEach(scan => {
        const row = document.createElement('tr');

        const sanitizedScanName = DOMPurify.sanitize(scan.scan_name);
        const sanitizedCategory = DOMPurify.sanitize(scan.category);
        const sanitizedTargetUrl = DOMPurify.sanitize(scan.target_url);
        const sanitizedToolUsed = DOMPurify.sanitize(scan.tool_used);
        const sanitizedScanResults = DOMPurify.sanitize(scan.scan_results);

        row.innerHTML = `
            <td>${sanitizedScanName}</td>
            <td>${sanitizedCategory}</td>
            <td><a href="${sanitizedTargetUrl}" target="_blank">${sanitizedTargetUrl}</a></td>
            <td>${sanitizedToolUsed}</td>
            <td>${scan.is_vulnerable ? 'Vulnerable' : 'Not Vulnerable'}</td>
            <td>${sanitizedScanResults}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to fetch and display the logged-in user's name
async function fetchAndDisplayUsername() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in.');
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('/api/auth/user', {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        const data = await response.json();

        if (response.ok) {
            const usernameElement = document.getElementById('username');
            usernameElement.textContent = data.username;
        } else {
            alert(`Error: ${data.message}`);
            localStorage.removeItem('token'); // Clear invalid token
            window.location.href = '/login.html'; // Redirect to login
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('An error occurred while fetching user details.');
        localStorage.removeItem('token'); // Clear invalid token
        window.location.href = '/login.html'; // Redirect to login
    }
}

// Fetch scans and user details when the dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayUsername(); // Fetch and display the username
    fetchAllScans(); // Fetch and display scans
});