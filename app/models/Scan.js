const db = require('./db');

class Scan {
    // Create a new scan entry
    static async createScan(userId, scanName, category, targetUrl, toolUsed, isVulnerable, scanResults, categoryId = null) {
        try {
            console.log('Inserting scan into database:', { userId, scanName, category, targetUrl, toolUsed, isVulnerable, categoryId });
    
            const [result] = await db.query(
                'INSERT INTO scans (user_id, scan_name, category, target_url, tool_used, is_vulnerable, scan_results, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, scanName, category, targetUrl, toolUsed, isVulnerable, scanResults, categoryId]
            );
    
            console.log('Scan inserted successfully:', { insertId: result.insertId });
    
            return result.insertId;
        } catch (error) {
            console.error('Error inserting scan into database:', error);
            throw error; // Rethrow the error to be handled by the controller
        }
    }

    // Fetch all scans for a user
    static async getAllScans(userId) {
        try {
            console.log('Fetching all scans for user:', { userId });

            const [rows] = await db.query('SELECT * FROM scans WHERE user_id = ? ORDER BY scanned_at DESC', [userId]);

            console.log('Scans fetched successfully:', rows);

            return rows;
        } catch (error) {
            console.error('Error fetching scans:', error);
            throw error; // Rethrow the error to be handled by the controller
        }
    }
}

module.exports = Scan;