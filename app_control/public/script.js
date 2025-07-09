const apiBaseUrl = 'http://localhost:5000/api';
let currentPath = '';

document.addEventListener('DOMContentLoaded', () => {
    // Fetch system info and files on page load
    fetchSystemInfo();
    fetchFiles();
});

// Open Terminal and Prompt for Command
function executeCommandPrompt() {
    const command = prompt('Enter command to execute:');
    if (!command) return; // Exit if no command is entered

    executeCommand(command);
}

// Execute Command via Backend API
async function executeCommand(command) {
    const outputContainer = document.getElementById('commandOutput');
    outputContainer.textContent = 'Executing...\n';

    try {
        const response = await fetch(`${apiBaseUrl}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Format and display the output
        outputContainer.textContent = `
            Command: ${command}
            Exit Code: ${result.returncode}
            Output:
${result.stdout || '(No output)'}
            Errors:
${result.stderr || '(No errors)'}
        `;
    } catch (error) {
        outputContainer.textContent = `Error: ${error.message}`;
    }
}

// Fetch System Info
async function fetchSystemInfo() {
    try {
        const response = await fetch(`${apiBaseUrl}/system-info`);
        if (!response.ok) throw new Error('Failed to fetch system info');
        const data = await response.json();

        // Update CPU Info
        document.getElementById('cpuInfo').innerHTML = `
            <h4><i class="icon">💻</i> CPU</h4>
            <div class="details">
                <div class="metric">
                    <span>Usage:</span>
                    <div class="progress-bar">
                        <div style="width: ${data.cpu.usage}%">${data.cpu.usage}%</div>
                    </div>
                </div>
                <div class="metric">
                    <span>Cores:</span>
                    <span>${data.cpu.cores}</span>
                </div>
                <div class="metric">
                    <span>Frequency:</span>
                    <span>${data.cpu.frequency} GHz</span>
                </div>
            </div>
        `;

        // Update Memory Info
        document.getElementById('memoryInfo').innerHTML = `
            <h4><i class="icon">💾</i> Memory</h4>
            <div class="details">
                <div class="metric">
                    <span>Usage:</span>
                    <div class="progress-bar">
                        <div style="width: ${(data.memory.used / data.memory.total) * 100}%">
                            ${data.memory.used}GB / ${data.memory.total}GB
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update GPU Info
        let gpuHtml = '';
        if (data.gpu.length > 0) {
            data.gpu.forEach((gpu, index) => {
                gpuHtml += `
                    <div class="gpu-card">
                        <h4><i class="icon">🎮</i> GPU ${index + 1}: ${gpu.name}</h4>
                        <div class="details">
                            <div class="metric">
                                <span>Load:</span>
                                <div class="progress-bar">
                                    <div style="width: ${gpu.load}%">${gpu.load}%</div>
                                </div>
                            </div>
                            <div class="metric">
                                <span>Memory:</span>
                                <div class="progress-bar">
                                    <div style="width: ${(gpu.memory_used / gpu.memory_total) * 100}%">
                                        ${gpu.memory_used}GB / ${gpu.memory_total}GB
                                    </div>
                                </div>
                            </div>
                            <div class="metric">
                                <span>Temperature:</span>
                                <span>${gpu.temperature}°C</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            gpuHtml = '<div class="error-message">No GPU detected</div>';
        }
        document.getElementById('gpuInfo').innerHTML = gpuHtml;
    } catch (error) {
        console.error('Error fetching system info:', error);
        document.getElementById('cpuInfo').innerHTML = '<div class="error-message">Failed to load CPU info</div>';
        document.getElementById('memoryInfo').innerHTML = '<div class="error-message">Failed to load Memory info</div>';
        document.getElementById('gpuInfo').innerHTML = '<div class="error-message">Failed to load GPU info</div>';
    }
}

// Periodically refresh system stats every 5 seconds
setInterval(fetchSystemInfo, 5000);

// Fetch Files from Backend
async function fetchFiles(path = '') {
    try {
        const response = await fetch(`${apiBaseUrl}/files?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        const data = await response.json();
        currentPath = data.current_path; // Update from API response
        updateBreadcrumb(data.current_path);
        populateFileGrid(data.items);
    } catch (error) {
        console.error('Error fetching files:', error);
        document.getElementById('fileGrid').innerHTML =
            '<div class="error-message">Access denied or path not found</div>';
    }
}

// Update Breadcrumb Navigation
function updateBreadcrumb(path) {
    const parts = path.split('/').filter(p => p);
    const breadcrumb = parts.map((part, index) => `
        <span class="breadcrumb-item" onclick="fetchFiles('${parts.slice(0, index + 1).join('/')}')">
            ${part}
        </span>
    `).join(' > ');
    document.getElementById('breadcrumb').innerHTML = `Home${breadcrumb.length ? ' > ' + breadcrumb : ''}`;
}

// Populate File Grid
function populateFileGrid(items) {
    const grid = document.getElementById('fileGrid');
    grid.innerHTML = items.map(item => `
        <div class="file-item ${item.type}" onclick="handleItemClick('${item.name}', '${item.type}')">
            <div class="file-icon">
                ${item.type === 'directory' ? '📁' : '📄'}
            </div>
            <div class="file-details">
                <div class="file-name">${item.name}</div>
                <div class="file-meta">
                    ${formatSize(item.size)} • ${new Date(item.modified).toLocaleString()}
                </div>
            </div>
            ${item.type === 'file' ? `
                <button class="download-btn" onclick="downloadFile(event, '${item.path}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path d="M12 16L16 12H13V8H11V12H8l4 4zm-6-6h2v4H6v-4zm12 4h-2v-4h2v4z"/>
                    </svg>
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Handle File Clicks
function handleItemClick(name, type) {
    if (type === 'directory') {
        fetchFiles(`${currentPath}/${name}`);
    }
}

// Download File
function downloadFile(e, filepath) {
    e.stopPropagation();
    window.location.href = `${apiBaseUrl}/download/${encodeURIComponent(filepath)}`;
}

// Navigate to Path
function navigatePath() {
    let newPath = document.getElementById('currentPath').value.trim();
    if (/^[a-zA-Z]:/.test(newPath) || newPath.startsWith('/')) {
        alert('Absolute paths are not allowed. Use relative paths only.');
        return;
    }
    fetchFiles(newPath);
}

// Format File Size
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Filter files based on search input
function filterFiles() {
    const query = document.getElementById('searchInput').value.toLowerCase(); // Get the search query
    const fileGrid = document.getElementById('fileGrid'); // Get the file grid container
    const items = Array.from(fileGrid.getElementsByClassName('file-item')); // Get all file items

    items.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase(); // Get the file name
        if (fileName.includes(query)) {
            item.style.display = 'block'; // Show matching files
        } else {
            item.style.display = 'none'; // Hide non-matching files
        }
    });
}