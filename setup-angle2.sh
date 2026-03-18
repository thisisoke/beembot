#!/bin/bash

# ============================================================

# BeemBot Setup Script — Angle 2

# Homebrew + Ollama CLI with Metal GPU acceleration

# 

# Use this if the main setup.sh (Ollama .app) didn't work.

# 

# How to run:

# 1. Open Terminal

# 2. Type: bash

# 3. Drag this file into the Terminal window

# 4. Hit Enter

# ============================================================

set -e  # Stop on any error

# Always use current working directory

# IMPORTANT: cd into the BeemBot-Prototype-Folder before running this script

SCRIPT_DIR="$(pwd)"
MODEL_FILE="$SCRIPT_DIR/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"
MODEL_NAME="llama3.1-beembot"
PORT=8080

echo ""
echo "╔══════════════════════════════════════╗"
echo "║    BeemBot Setup — Angle 2 (CLI)     ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Homebrew ────────────────────────────────────────

echo "▶ Step 1/4 — Checking Homebrew…"

if command -v brew &>/dev/null; then
echo "  ✓ Homebrew already installed"
else
echo "  Installing Homebrew (you may be asked for your password)…"
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add brew to PATH immediately for this session

if [[ -f "/opt/homebrew/bin/brew" ]]; then
# Apple Silicon path
eval "$(/opt/homebrew/bin/brew shellenv)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
elif [[ -f "/usr/local/bin/brew" ]]; then
# Intel Mac path
eval "$(/usr/local/bin/brew shellenv)"
fi

if ! command -v brew &>/dev/null; then
echo ""
echo "  ✗ ERROR: Homebrew install failed or was blocked."
echo "  This script requires Homebrew. Your network or IT policy"
echo "  may be preventing the install."
echo "  Try Angle 1 (setup.sh) or Angle 3 (LM Studio) instead."
exit 1
fi

echo "  ✓ Homebrew installed"
fi

# ── Step 2: Ollama CLI via Homebrew ─────────────────────────

echo ""
echo "▶ Step 2/4 — Checking Ollama…"

if command -v ollama &>/dev/null; then
echo "  ✓ Ollama already installed"
else
echo "  Installing Ollama CLI via Homebrew…"
brew install ollama

if ! command -v ollama &>/dev/null; then
echo ""
echo "  ✗ ERROR: Ollama install failed."
exit 1
fi

echo "  ✓ Ollama installed"
fi

# ── Step 3: Load the model ──────────────────────────────────

echo ""
echo "▶ Step 3/4 — Loading the LLM model…"

# Start ollama with Metal flag to check model list

if ! pgrep -x "ollama" > /dev/null; then
OLLAMA_METAL=1 ollama serve &>/dev/null &
sleep 2
fi

if ollama list 2>/dev/null | grep -q "$MODEL_NAME"; then
echo "  ✓ Model '$MODEL_NAME' already loaded"
else
if [[ ! -f "$MODEL_FILE" ]]; then
echo ""
echo "  ✗ ERROR: Model file not found at:"
echo "    $MODEL_FILE"
echo ""
echo "  Make sure the .gguf file is in the same folder as this script."
exit 1
fi

echo "  Importing model from local file — this takes about 1 minute…"
MODELFILE="$SCRIPT_DIR/Modelfile.tmp"
echo "FROM $MODEL_FILE" > "$MODELFILE"
ollama create "$MODEL_NAME" -f "$MODELFILE"
rm -f "$MODELFILE"
echo "  ✓ Model imported as '$MODEL_NAME'"
fi

# ── Step 4: Start everything ────────────────────────────────

echo ""
echo "▶ Step 4/4 — Starting BeemBot…"

# Kill any existing ollama and restart with Metal flag

pkill -x ollama 2>/dev/null || true
sleep 1

echo "  Starting Ollama with Metal GPU acceleration…"
OLLAMA_METAL=1 ollama serve &>/dev/null &
sleep 2

if ! pgrep -x "ollama" > /dev/null; then
echo ""
echo "  ✗ ERROR: Ollama server failed to start."
exit 1
fi
echo "  ✓ Ollama running with Metal GPU at http://localhost:11434"

# Check python3

if ! command -v python3 &>/dev/null; then
echo ""
echo "  ✗ ERROR: python3 not found."
echo "  Python3 comes pre-installed on most Macs."
echo "  If missing, download from https://www.python.org/downloads/"
exit 1
fi

# Free up port if already in use

lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

echo "  ✓ Starting web server on port $PORT"
echo ""
echo "╔══════════════════════════════════════╗"
echo "║           BeemBot is ready!          ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  Browser opening at http://localhost:$PORT"
echo ""
echo "  In the app:"
echo "    Server URL → http://localhost:11434"
echo "    Model      → $MODEL_NAME"
echo ""
echo "  ⚡ Running with Metal GPU acceleration"
echo ""
echo "  Press Ctrl+C in this window to stop."
echo ""

# Open browser after short delay

(sleep 5 && open "http://localhost:$PORT") &

# Start web server from dist folder

cd "$SCRIPT_DIR/beembot-webapp/dist"
python3 -m http.server $PORT
