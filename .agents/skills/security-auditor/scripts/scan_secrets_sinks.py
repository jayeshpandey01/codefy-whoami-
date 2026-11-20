#!/usr/bin/env python3
"""
scan_secrets_sinks.py
Scans source files for secrets and dangerous sink patterns.
"""
import os
import re
import sys
import argparse

SECRET_PATTERNS = [
    (r'(?i)(jwt[_-]?secret|secret[_-]?key|api[_-]?key|auth[_-]?token)\s*=\s*["\']([^"\']{8,})["\']', "Potential Hardcoded Secret / Token"),
    (r'(?i)(postgres|mysql|mongodb|redis):\/\/[a-zA-Z0-9_-]+:[^@]+@[a-zA-Z0-9_.-]+', "Database Connection String with Credentials"),
    (r'-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----', "Private Cryptographic Key"),
    (r'AKIA[0-9A-Z]{16}', "AWS Access Key ID"),
]

SINK_PATTERNS = [
    (r'subprocess\.(?:Popen|run|call)\([^)]*shell\s*=\s*True', "Dangerous subprocess with shell=True"),
    (r'os\.system\s*\(', "Direct os.system command execution"),
    (r'pickle\.loads\s*\(', "Unsafe pickle deserialization"),
    (r'yaml\.load\([^)]*Loader\s*=\s*(?:yaml\.)?Loader', "Unsafe PyYAML Loader"),
    (r'(?:cursor|session|db)\.execute\(\s*f["\']', "SQL query via f-string (SQL injection risk)"),
]

def scan_file(filepath):
    findings = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception as e:
        return findings

    for idx, line in enumerate(lines, 1):
        for pattern, desc in SECRET_PATTERNS:
            if re.search(pattern, line):
                findings.append({
                    "file": filepath,
                    "line": idx,
                    "type": "SECRET",
                    "description": desc,
                    "preview": line.strip()[:100]
                })
        for pattern, desc in SINK_PATTERNS:
            if re.search(pattern, line):
                findings.append({
                    "file": filepath,
                    "line": idx,
                    "type": "DANGEROUS_SINK",
                    "description": desc,
                    "preview": line.strip()[:100]
                })
    return findings

def main():
    parser = argparse.ArgumentParser(description="Scan source code for secrets and dangerous sinks.")
    parser.add_argument("--path", default=".", help="Root directory to scan")
    args = parser.parse_args()

    ignored_dirs = {".git", ".agents", "node_modules", "venv", ".venv", "__pycache__"}
    all_findings = []

    for root, dirs, files in os.walk(args.path):
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        for f in files:
            if f.endswith(('.py', '.js', '.ts', '.env', '.json', '.yaml', '.yml')):
                filepath = os.path.join(root, f)
                all_findings.extend(scan_file(filepath))

    print(f"Scanned directory: {args.path}")
    print(f"Total findings: {len(all_findings)}")
    for f in all_findings:
        print(f"[{f['type']}] {f['file']}:{f['line']} - {f['description']}")
        print(f"    Content: {f['preview']}")

if __name__ == "__main__":
    main()

