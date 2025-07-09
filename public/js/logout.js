/**
 * Logs out the user by clearing the token and redirecting to the login page.
 */
function logout() {
    try {
        // Clear the JWT token and username from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // Redirect to the login page
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out.');
    }
}