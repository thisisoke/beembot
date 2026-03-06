#!/bin/bash

# ============================================================
#  BeemBot Setup Script
#  Run this once to set everything up on a new Mac
# ============================================================

set -e  # Stop on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_FILE="$SCRIPT_DIR/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"
MODEL_NAME="llama3.1-beembot"
PORT=8080

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        BeemBot Setup — Starting      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Homebrew ────────────────────────────────────────
echo "▶ Step 1/4 — Checking Homebrew..."
if command -v brew &>/dev/null; then
  echo "  ✓ Homebrew already installed"
else
  echo "  Installing Homebrew (you may be asked for your password)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Add brew to PATH for Apple Silicon Macs
  if [[ -f "/opt/homebrew/bin/brew" ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  fi
  echo "  ✓ Homebrew installed"
fi

# ── Step 2: Ollama ──────────────────────────────────────────
echo ""
echo "▶ Step 2/4 — Checking Ollama..."
if command -v ollama &>/dev/null; then
  echo "  ✓ Ollama already installed"
else
  echo "  Installing Ollama..."
  brew install ollama
  echo "  ✓ Ollama installed"
fi

# ── Step 3: Load the model ──────────────────────────────────
echo ""
echo "▶ Step 3/4 — Loading the LLM model..."

if ! ollama list 2>/dev/null | grep -q "$MODEL_NAME"; then
  if [[ ! -f "$MODEL_FILE" ]]; then
    echo ""
    echo "  ✗ ERROR: Model file not found at:"
    echo "    $MODEL_FILE"
    echo ""
    echo "  Make sure the .gguf file is in the same folder as this script."
    exit 1
  fi
  echo "  Importing model from local file (this takes ~1 minute)..."
  
  # Create a temporary Modelfile for ollama
  MODELFILE="$SCRIPT_DIR/Modelfile.tmp"
  echo "FROM $MODEL_FILE" > "$MODELFILE"
  ollama create "$MODEL_NAME" -f "$MODELFILE"
  rm "$MODELFILE"
  echo "  ✓ Model imported as '$MODEL_NAME'"
else
  echo "  ✓ Model '$MODEL_NAME' already loaded"
fi

# ── Step 4: Start everything ────────────────────────────────
echo ""
echo "▶ Step 4/4 — Starting BeemBot..."

# Start ollama in background if not already running
if ! pgrep -x "ollama" > /dev/null; then
  echo "  Starting Ollama server..."
  ollama serve &>/dev/null &
  sleep 2
  echo "  ✓ Ollama running"
else
  echo "  ✓ Ollama already running"
fi

# Check python3 is available
if ! command -v python3 &>/dev/null; then
  echo ""
  echo "  ✗ ERROR: python3 not found. This is unexpected on a Mac."
  echo "  Try running: brew install python"
  exit 1
fi

# Kill anything already on port 8080
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════╗"
echo "║           BeemBot is ready!          ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  Opening browser at http://localhost:$PORT ..."
echo ""
echo "  Inside the app, set:"
echo "    Server URL → http://localhost:11434"
echo "    Model      → $MODEL_NAME"
echo ""
echo "  Press Ctrl+C to stop the server when done."
echo ""

# Open browser after a short delay
(sleep 1 && open "http://localhost:$PORT") &

# Start the web server from the dist folder
cd "$SCRIPT_DIR/beembot-webapp/dist"
python3 -m http.server $PORT
