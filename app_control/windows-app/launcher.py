import subprocess
import time

# Start Python Flask Server
flask_process = subprocess.Popen(["python", "controller.py"], cwd="windows-app", shell=True)

# Start Node.js Server
node_process = subprocess.Popen(["node", "server/index.js"], cwd="server", shell=True)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    flask_process.terminate()
    node_process.terminate()
