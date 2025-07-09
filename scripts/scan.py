import nmap
import sys
import json

def scan_network(ip):
    nm = nmap.PortScanner()
    nm.scan(hosts=ip, arguments='-sV')  # Perform a service version detection scan
    results = []

    for host in nm.all_hosts():
        host_data = {
            "host": host,
            "hostname": nm[host].hostname(),
            "state": nm[host].state(),
            "protocols": {}
        }
        for proto in nm[host].all_protocols():
            host_data["protocols"][proto] = []
            ports = nm[host][proto].keys()
            for port in ports:
                port_data = {
                    "port": port,
                    "state": nm[host][proto][port]['state'],
                    "service": nm[host][proto][port]['name'],
                    "version": nm[host][proto][port]['version']
                }
                host_data["protocols"][proto].append(port_data)
        results.append(host_data)

    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "IP address is required."}))
        sys.exit(1)

    ip = sys.argv[1]
    try:
        result = scan_network(ip)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))