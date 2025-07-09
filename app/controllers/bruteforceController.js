const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.bruteForce = (req, res) => {
    const { target } = req.body; // Extract target from the request body
    const wordlistFile = req.file; // Use req.file for the uploaded file

    // Debugging: Log the received data
    console.log("Received target:", target);
    console.log("Received wordlist file:", wordlistFile);

    if (!target || !wordlistFile) {
        return res.status(400).json({ error: 'Target URL and wordlist are required.' });
    }

    // Save uploaded wordlist to a temporary file
    const tempFilePath = path.join(__dirname, '../../temp', wordlistFile.originalname); // Correct path to temp folder
    fs.rename(wordlistFile.path, tempFilePath, (err) => {
        if (err) {
            console.error(`Error saving wordlist: ${err.message}`);
            return res.status(500).json({ error: 'Failed to upload wordlist.' });
        }

        // Wrap the Python path in double quotes and escape backslashes
        const pythonPath = '"C:/Users/User/AppData/Local/Programs/Python/Python313/python.exe"'; // Example path
        const scriptPath = path.resolve(__dirname, '../../scripts/bruteforce.py'); // Adjust relative path if needed

        console.log(`Executing: ${pythonPath} ${scriptPath} ${target} ${tempFilePath}`); // Debugging line

        exec(`${pythonPath} ${scriptPath} ${target} ${tempFilePath}`, (error, stdout, stderr) => {
            console.log("Script stdout:", stdout); // Log the script's output
            console.error("Script stderr:", stderr); // Log any errors from the script

            if (error) {
                console.error(`Error: ${stderr}`);
                return res.status(500).json({ error: stderr || 'Failed to execute Python script.' });
            }
            try {
                const result = JSON.parse(stdout);
                res.json(result);
            } catch (e) {
                console.error(`Failed to parse script output: ${stdout}`);
                res.status(500).json({ error: 'Failed to parse brute-force results.' });
            }
        });
    });
};