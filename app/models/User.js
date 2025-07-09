const db = require('./db');

class User {
    /**
     * Create a new user.
     * @param {string} username - The user's username.
     * @param {string} email - The user's email.
     * @param {string} password - The user's plain text password.
     * @returns {number} - The ID of the newly created user.
     */
    static async createUser(username, email, password) {
        try {
            console.log('Inserting user into database:', { username, email });
            const [result] = await db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, password]
            );
            console.log('User inserted successfully:', { insertId: result.insertId });
            return result.insertId;
        } catch (error) {
            console.error('Error inserting user into database:', error);
            throw error; // Rethrow the error to be handled by the controller
        }
    }

    /**
     * Find a user by email.
     * @param {string} email - The user's email.
     * @returns {Object|null} - The user object or null if not found.
     */
    static async findUserByEmail(email) {
        try {
            console.log('Searching for user by email:', { email });
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            console.log('Search result:', rows);
            return rows[0]; // Return the first matching user or null if no user is found
        } catch (error) {
            console.error('Error searching for user by email:', error);
            throw error; // Rethrow the error to be handled by the controller
        }
    }

    /**
     * Find a user by ID.
     * @param {number} id - The user's ID.
     * @returns {Object|null} - The user object or null if not found.
     */
    static async findUserById(id) {
        try {
            console.log('Searching for user by ID:', { id });
            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
            console.log('Search result:', rows);
            return rows[0]; // Return the first matching user or null if no user is found
        } catch (error) {
            console.error('Error searching for user by ID:', error);
            throw error; // Rethrow the error to be handled by the controller
        }
    }
}

module.exports = User;