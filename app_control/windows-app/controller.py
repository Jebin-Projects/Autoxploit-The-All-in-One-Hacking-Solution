import os
import platform
import psutil
import subprocess
from flask import Flask, request, jsonify, send_file, abort
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
UPLOAD_FOLDER = os.path.expanduser('~')  # User's home directory
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

def validate_path(path):
    # Join and normalize the requested path
    requested_path = os.path.abspath(os.path.normpath(os.path.join(UPLOAD_FOLDER, path)))
    
    # Normalize case for Windows case-insensitive comparison
    normalized_upload = os.path.normcase(UPLOAD_FOLDER)
    normalized_requested = os.path.normcase(requested_path)
    
    # Check for Windows cross-drive access
    if os.name == 'nt':
        upload_drive = os.path.splitdrive(normalized_upload)[0]
        requested_drive = os.path.splitdrive(normalized_requested)[0]
        if upload_drive != requested_drive:
            abort(403, description="Cross-drive access prohibited")
    
    # Ensure path is within UPLOAD_FOLDER
    if not normalized_requested.startswith(normalized_upload):
        abort(403, description="Access denied")
    
    return requested_path

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden', 'message': str(error)}), 403

@app.route('/api/files', methods=['GET'])
def list_files():
    path = request.args.get('path', '')
    current_path = validate_path(path)
    
    try:
        items = []
        for item in os.listdir(current_path):
            item_path = os.path.join(current_path, item)
            stat = os.stat(item_path)
            items.append({
                'name': item,
                'type': 'directory' if os.path.isdir(item_path) else 'file',
                'size': stat.st_size,
                'modified': stat.st_mtime,
                'path': os.path.relpath(item_path, UPLOAD_FOLDER).replace('\\', '/')  # Ensure consistent path format
            })
        return jsonify({
            'current_path': os.path.relpath(current_path, UPLOAD_FOLDER).replace('\\', '/'),
            'items': items
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ... Keep other routes (system-info, upload, download, execute) unchanged ...

import psutil
import GPUtil  # For GPU information

@app.route('/api/system-info', methods=['GET'])
def system_info():
    try:
        # CPU Info
        cpu_usage = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count(logical=True)  # Logical cores
        cpu_freq = psutil.cpu_freq()
        cpu_freq_current = round(cpu_freq.current, 1) if cpu_freq else "N/A"

        # Memory Info
        memory = psutil.virtual_memory()
        total_memory_gb = round(memory.total / (1024 ** 3), 1)
        used_memory_gb = round(memory.used / (1024 ** 3), 1)

        # GPU Info
        gpus = GPUtil.getGPUs()
        gpu_info = []
        for gpu in gpus:
            gpu_info.append({
                'name': gpu.name,
                'load': round(gpu.load * 100, 1),
                'memory_total': round(gpu.memoryTotal / 1024, 1),  # Convert MB to GB
                'memory_used': round(gpu.memoryUsed / 1024, 1),
                'temperature': gpu.temperature
            })

        return jsonify({
            'cpu': {
                'usage': cpu_usage,
                'cores': cpu_count,
                'frequency': cpu_freq_current
            },
            'memory': {
                'total': total_memory_gb,
                'used': used_memory_gb
            },
            'gpu': gpu_info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files', methods=['GET'], endpoint='list_files_endpoint')
def list_files():
    path = request.args.get('path', '')
    current_path = validate_path(path)
    
    try:
        items = []
        for item in os.listdir(current_path):
            item_path = os.path.join(current_path, item)
            stat = os.stat(item_path)
            items.append({
                'name': item,
                'type': 'directory' if os.path.isdir(item_path) else 'file',
                'size': stat.st_size,
                'modified': stat.st_mtime,
                'path': os.path.relpath(item_path, UPLOAD_FOLDER).replace('\\', '/')
            })
        return jsonify({
            'current_path': os.path.relpath(current_path, UPLOAD_FOLDER).replace('\\', '/'),
            'items': items
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from werkzeug.utils import secure_filename
import os

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400

    file = request.files['file']
    path = request.form.get('path', '')
    target_path = validate_path(path)

    # Validate file name and extension
    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({'error': 'Invalid file name'}), 400

    # Check for file size limit (50MB)
    if len(file.read()) > app.config['MAX_CONTENT_LENGTH']:
        return jsonify({'error': 'File size exceeds the limit (50MB)'}), 413
    file.seek(0)  # Reset file pointer after reading

    # Save the file
    try:
        file.save(os.path.join(target_path, filename))
        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<path:filepath>', methods=['GET'])
def download_file(filepath):
    safe_path = validate_path(filepath)
    if not os.path.isfile(safe_path):
        abort(404)
    return send_file(safe_path, as_attachment=True, 
                   mimetype='application/octet-stream',
                   download_name=os.path.basename(safe_path))

@app.route('/api/execute', methods=['POST'])
def execute_command():
    command = request.json.get('command', '')
    if not command:
        return jsonify({'error': 'No command provided'}), 400
        
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        })
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Command timed out'}), 408

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)