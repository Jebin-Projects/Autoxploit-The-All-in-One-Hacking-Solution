const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../public')));

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let appProcess = null;

// Start Python Backend
app.post('/api/app/start', (req, res) => {
    if (!appProcess) {
        appProcess = spawn('python', ['controller.py'], { shell: true });

        appProcess.stdout.on('data', data => console.log(`[PYTHON LOG]: ${data.toString().trim()}`));
        appProcess.stderr.on('data', data => console.error(`[PYTHON ERROR]: ${data.toString().trim()}`));
        appProcess.on('exit', code => {
            console.log(`[PYTHON EXITED]: Code ${code}`);
            appProcess = null;
        });

        return res.json({ message: 'App started' });
    } else {
        return res.json({ message: 'App already running' });
    }
});

// Stop Python Backend
app.post('/api/app/stop', (req, res) => {
    if (appProcess) {
        appProcess.kill();
        appProcess = null;
        return res.json({ message: 'App stopped' });
    } else {
        return res.json({ message: 'App not running' });
    }
});

// Execute System Command
app.post('/api/command', async (req, res) => {
    const { command, directory } = req.body;
    if (!command) return res.status(400).json({ message: 'Command required' });

    const cmdProcess = spawn('python', ['controller.py', 'execute'], {
        shell: true,
        env: { ...process.env, COMMAND: command, DIRECTORY: directory || process.cwd() }
    });

    let output = [];
    cmdProcess.stdout.on('data', data => output.push(...data.toString().split('\r\n')));
    cmdProcess.stderr.on('data', data => output.push(...data.toString().split('\r\n')));
    cmdProcess.on('exit', () => res.json({ output: output.filter(line => line.trim() !== '') }));
});

// Upload File
app.post('/api/file/upload', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file;
    const uploadPath = path.join(UPLOADS_DIR, file.name);

    file.mv(uploadPath, err => {
        if (err) return res.status(500).json({ message: 'File upload failed' });
        return res.json({ message: 'File uploaded successfully', filename: file.name });
    });
});

// Download File
app.get('/api/file/download/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Get System Information
app.get('/api/system/info', (req, res) => {
    const info = {
        platform: os.platform(),
        architecture: os.arch(),
        cpu: os.cpus()[0].model,
        memory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    };
    res.json(info);
});

// Start Server
app.listen(PORT, () => console.log(`Server running at: http://localhost:${PORT}`));
