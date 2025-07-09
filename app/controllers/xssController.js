const { exec } = require('child_process');
const path = require('path');

exports.xssScan = (req, res) => {
    console.log("Received request body:", req.body);

    const { url } = req.body;

    // Validate required fields
    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    const pythonPath = '"C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"';
    const scriptPath = path.resolve(__dirname, '../../scripts/xss_scan.py');

    const args = [url];

    console.log(`Executing: ${pythonPath} ${scriptPath} ${args.map(arg => `"${arg}"`).join(' ')}`);

    exec(`${pythonPath} ${scriptPath} ${args.map(arg => `"${arg}"`).join(' ')}`, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            console.error("Error executing Python script:", stderr || error.message);
            return res.status(500).json({ error: stderr || 'Failed to execute Python script.' });
        }

        try {
            const result = JSON.parse(stdout); // Parse the Python script's output as JSON
            if (result.error) {
                return res.status(500).json({ error: result.error });
            }
            res.json(result); // Send the parsed JSON response
        } catch (e) {
            console.error("Failed to parse script output:", stdout);
            res.status(500).json({ error: 'Failed to parse vulnerability scan results.' });
        }
    });
};