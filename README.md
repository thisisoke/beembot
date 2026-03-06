# BeemBot — Setup Guide

A local AI assistant for financial advisors. Everything runs on your machine — no data leaves your computer.

---

## What's in this folder

```
BeemBot-Prototype-Folder/
├── beembot-webapp/         ← the app
├── Meta-Llama-3.1-8B-...gguf  ← the AI model (don't move this)
├── setup.sh                ← run this once to get started
└── README.md               ← you're reading this
```

---

## First time setup (do this once)

### Step 1 — Allow the script to run

Open **Terminal** (press `Cmd + Space`, type "Terminal", hit Enter).

Drag the `setup.sh` file into the Terminal window — it will paste the file path automatically. Then type a space and press Enter... 

Actually, just run this command instead (copy and paste it):

```bash
chmod +x ~/Downloads/BeemBot-Prototype-Folder/setup.sh
```

> If your folder is somewhere other than Downloads, adjust the path.

### Step 2 — Run the setup script

```bash
~/Downloads/BeemBot-Prototype-Folder/setup.sh
```

The script will:
- Install Homebrew (Mac package manager) if needed
- Install the Ollama macOS app (the local LLM runner) if needed
- Import the Llama model from the included `.gguf` file
- Start the AI server
- Open BeemBot in your browser automatically

**The first run takes about 2–3 minutes.** After that it's fast.

---

## Every time after that

Just double-click `setup.sh` in Finder.

> If double-clicking doesn't work, right-click → Open With → Terminal.

Or in Terminal:
```bash
~/Downloads/BeemBot-Prototype-Folder/setup.sh
```

---

## Inside the app

Once BeemBot opens in your browser:

1. **Server URL** should already say `http://localhost:11434` — leave it
2. **Model** — type `llama3.1-beembot` (the script sets this up for you)
3. The status dot should turn **green** (Connected to Ollama)
4. Start chatting in the panel on the right

---

## Stopping BeemBot

Go back to the Terminal window and press `Ctrl + C`.

---

## Troubleshooting

**"Permission denied" when running setup.sh**
Run this first, then try again:
```bash
chmod +x ~/Downloads/BeemBot-Prototype-Folder/setup.sh
```

**Browser opens but app is blank**
Wait 5 seconds and refresh. The server may still be starting.

**Status dot stays red ("Ollama not reachable")**
Open a new Terminal tab and run:
```bash
ollama serve
```
Then refresh the browser.

**"Model not found" error in the chat**
Make sure the Model field says exactly `llama3.1-beembot` and try again.

**Port 8080 already in use**
The script clears this automatically. If it still fails, restart your computer and run setup again.
