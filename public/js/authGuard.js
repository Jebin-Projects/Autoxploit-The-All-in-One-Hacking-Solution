/**
 * Updates the navigation bar based on the user's authentication status.
 */
/**
 * Updates the navigation bar based on the user's authentication status.
 */
function updateNavbar() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authStatusElement = document.getElementById('auth-status');
    const signupDashboardElement = document.getElementById('signup-dashboard');

    // Check if the required elements exist in the DOM
    if (!authStatusElement || !signupDashboardElement) {
        console.warn('Navbar elements (auth-status or signup-dashboard) not found in the DOM.');
        return;
    }

    if (token && username) {
        // User is logged in
        authStatusElement.innerHTML = `<span>Hi, ${username}</span>`;
        signupDashboardElement.innerHTML = `
            <button id="homeButton" class="btn" onclick="window.location.href='/index.html'">Home</button>
            <button id="dashboardButton" class="btn" onclick="window.location.href='/dashboard.html'">Dashboard</button>
            <button id="logoutButton" class="btn" onclick="logout()">Logout</button>
        `;
    } else {
        // User is not logged in
        authStatusElement.innerHTML = `<button id="loginButton" class="btn" onclick="window.location.href='/login.html'">Login</button>`;
        signupDashboardElement.innerHTML = `
            <button id="signupButton" class="btn" onclick="window.location.href='/signup.html'">Signup</button>
        `;
    }
}

/**
 * Redirects the user to the dashboard if they are already logged in and on a public page.
 */
/**
 * Redirects the user to the dashboard if they are already logged in and on a public page.
 */
function redirectIfLoggedIn(protectedPages = [], excludedPages = []) {
    const token = localStorage.getItem('token');
    let currentPage = window.location.pathname;

    // Normalize the current page path (remove trailing slash)
    currentPage = currentPage.endsWith('/') ? currentPage.slice(0, -1) : currentPage;

    // Ensure parameters are always arrays
    protectedPages = Array.isArray(protectedPages) ? protectedPages.map(page => page.endsWith('/') ? page.slice(0, -1) : page) : [];
    excludedPages = Array.isArray(excludedPages) ? excludedPages.map(page => page.endsWith('/') ? page.slice(0, -1) : page) : [];

    console.log("🔍 Checking redirection...");
    console.log("Token found:", token ? "✅ Yes" : "❌ No");
    console.log("Current Page:", currentPage);
    console.log("Protected Pages:", protectedPages);
    console.log("Excluded Pages:", excludedPages);

    if (token && !protectedPages.includes(currentPage) && !excludedPages.includes(currentPage)) {
        console.log("✅ Redirecting to /dashboard.html");
        window.location.href = '/dashboard.html';
    } else {
        console.log("🚫 No redirection needed.");
    }
}



/**
 * Requires authentication to access protected pages.
 */
function requireAuth() {
    const token = localStorage.getItem('token');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (!token) {
        alert('You must be logged in to access this page.');
        window.location.href = '/login.html';  // Make sure this redirects to login correctly
        return;
    }

    // Show loading spinner if it exists
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }

    // Fetch user details to validate the token
    fetch('/api/auth/user', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid token');
            }
            return response.json();
        })
        .then(data => {
            // Store the username in localStorage for future use
            localStorage.setItem('username', data.username);

            // Update the navigation bar dynamically
            updateNavbar();
        })
        .catch(error => {
            console.error('Authentication failed:', error.message);
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        })
        .finally(() => {
            // Hide loading spinner (ensure it's always hidden)
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
        });
}


/**
 * Logs the user out and redirects them to the login page.
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    alert('You have been logged out successfully.');
    window.location.href = '/index.html'; // Redirect to the homepage
}

document.addEventListener('DOMContentLoaded', () => {
    // Update the navigation bar dynamically
    updateNavbar();

    // Define protected pages
    const protectedPages = ['/dashboard.html'];

    // Define excluded pages (where redirection should NOT happen)
    const excludedPages = ['/index.html'];

    // Redirect to dashboard if logged in and on a public page (but not excluded pages)
    redirectIfLoggedIn(protectedPages, excludedPages);

    // Enforce authentication on protected pages
    if (protectedPages.includes(window.location.pathname)) {
        requireAuth();
    }
});
