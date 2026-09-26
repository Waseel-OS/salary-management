#!/usr/bin/env python3
"""
Employee Salary and Payslip Management System - Local Web Server
Runs on http://localhost:8080 (or fallback ports)
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import time

DEFAULT_PORT = 8080
FALLBACK_PORTS = [8080, 8000, 5000, 3000, 8888]

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # Clean formatted console log
        sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {args[0]} - {args[1]}\n")

def find_available_port(requested_port):
    ports_to_try = [requested_port] + [p for p in FALLBACK_PORTS if p != requested_port]
    for port in ports_to_try:
        try:
            with socketserver.TCPServer(("", port), None) as s:
                return port
        except OSError:
            continue
    return requested_port

def run_server(port=DEFAULT_PORT, open_browser=False):
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    port = find_available_port(port)
    
    class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    try:
        with ThreadedServer(("", port), CustomHTTPHandler) as httpd:
            url = f"http://localhost:{port}/"
            print("=" * 65)
            print("  EMPLOYEE SALARY & PAYSLIP MANAGEMENT SYSTEM")
            print("  Local Development Server Started Successfully!")
            print("=" * 65)
            print(f"\n  Access URL:     {url}")
            print(f"  Local Path:     {web_dir}")
            print(f"  Default Login:  admin / admin123\n")
            print("=" * 65)
            print("  Press Ctrl+C in this window to stop the server.\n")
            sys.stdout.flush()

            if open_browser:
                time.sleep(0.5)
                webbrowser.open(url)

            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped by user.")
    except Exception as e:
        print(f"\n[ERROR] Failed to start server: {e}")

if __name__ == '__main__':
    port = DEFAULT_PORT
    open_in_browser = False
    
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.isdigit():
                port = int(arg)
            elif arg in ('--open', '-o', 'open'):
                open_in_browser = True
                
    run_server(port, open_in_browser)
