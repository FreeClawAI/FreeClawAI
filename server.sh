#!/bin/bash
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[FreeClawAI] Node.js is not installed."
    echo ""
    echo "Please install Node.js:"
    echo "  macOS:   brew install node"
    echo "  Ubuntu:  sudo apt install nodejs npm"
    echo "  Or download from: https://nodejs.org/"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

# Display Node.js version
NODE_VERSION=$(node --version)
echo "[FreeClawAI] Node.js $NODE_VERSION detected."

echo "Starting FreeClawAI Server..."
node server.js