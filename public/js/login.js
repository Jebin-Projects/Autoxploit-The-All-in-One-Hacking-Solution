/**
 * Handles the login process.
 */
async function login(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        // Send login request to the server
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed.');
        }

        const data = await response.json();
        const token = data.token;

        // Ensure the token is received from the server
        if (!token) {
            throw new Error('Token not received from the server.');
        }

        // Fetch user details to get the username
        const userResponse = await fetch('/api/auth/user', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }, // Add "Bearer" prefix
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user details.');
        }

        const userData = await userResponse.json();
        const username = userData.username;

        // Store token and username in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        // Log success message for debugging
        console.log('Login successful. Token and username stored in localStorage.');

        // Redirect to the dashboard
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Error during login:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Checks if the user is already logged in and redirects them to the dashboard.
 */
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify if the token is still valid by redirecting to the dashboard
        alert('You are already logged in.');
        window.location.href = '/dashboard.html';
    }
});