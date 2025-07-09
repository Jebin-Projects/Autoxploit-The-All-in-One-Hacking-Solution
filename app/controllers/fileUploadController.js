const path = require('path');
const { exec } = require('child_process');

/**
 * Run the Python script to scan for file upload vulnerabilities.
 * @param {string} uploadUrl - The upload URL to test.
 * @param {string} baseUrl - The base URL to validate file upload.
 * @returns {Promise<Object>} - Resolves with parsed scan results.
 */
exports.fileUploadScan = async (uploadUrl, baseUrl) => {
    return new Promise((resolve, reject) => {
        // Validate inputs
        if (!uploadUrl || !baseUrl) {
            return reject(new Error('Both uploadUrl and baseUrl are required.'));
        }

        try {
            new URL(uploadUrl);
            new URL(baseUrl);
        } catch (e) {
            return reject(new Error('Invalid URL format.'));
        }

        // Set paths
        const pythonPath = '"C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"';
        const scriptPath = path.resolve(__dirname, '../../scripts/file_upload_scan.py');
        const args = [uploadUrl, baseUrl];
        const command = `${pythonPath} ${scriptPath} ${args.map(arg => `"${arg}"`).join(' ')}`;

        console.log('Executing:', command);

        exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing Python script:', stderr || error.message);
                return reject(new Error(stderr || 'Failed to execute Python script.'));
            }

            try {
                const result = JSON.parse(stdout);
                if (result.error) {
                    return reject(new Error(result.error));
                }

                console.log('Parsed Python script output:', result);
                resolve(result);
            } catch (e) {
                console.error('Failed to parse script output:', stdout);
                reject(new Error('Failed to parse vulnerability scan results.'));
            }
        });
    });
};
