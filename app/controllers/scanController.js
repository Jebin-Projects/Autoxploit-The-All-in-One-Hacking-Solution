const { exec } = require('child_process');
const path = require('path');

exports.scanNetwork = (req, res) => {
    const { ip } = req.body;

    if (!ip) {
        return res.status(400).json({ error: 'IP address is required.' });
    }

    // Replace "python3" with the full path to your Python executable
    const pythonPath = 'C:/Users/User/AppData/Local/Programs/Python/Python313/python.exe'; // Example path, adjust as needed
    const scriptPath = path.resolve(__dirname, '../../scripts/scan.py')

    exec(`${pythonPath} ${scriptPath} ${ip}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        try {
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse scan results.' });
        }
    });
};