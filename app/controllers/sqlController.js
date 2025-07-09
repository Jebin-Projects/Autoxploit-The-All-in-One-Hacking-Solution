// sqlController.js
const { exec } = require('child_process');
const path = require('path');

exports.vulnerabilityScan = (url) => {
    return new Promise((resolve, reject) => {
        const pythonPath = '"C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"';
        const scriptPath = path.resolve(__dirname, '../../scripts/sqli_scan.py');
        const args = [url];

        console.log(`Executing: ${pythonPath} ${scriptPath} ${args.map(arg => `"${arg}"`).join(' ')}`);

        exec(`${pythonPath} ${scriptPath} ${args.map(arg => `"${arg}"`).join(' ')}`, { timeout: 60000 }, (error, stdout, stderr) => {
            console.log('STDOUT:', stdout);
            console.log('STDERR:', stderr);
        
            if (error) {
                console.error("Error executing Python script:", stderr || error.message);
                return reject(stderr || error.message);
            }
        
            try {
                const result = JSON.parse(stdout); // This might be failing if output isn't valid JSON
                if (result.error) {
                    return reject(result.error);
                }
                resolve(result);
            } catch (e) {
                console.error("❌ Failed to parse script output:", stdout);
                reject('Failed to parse vulnerability scan results.');
            }
        });
        
    });
};
