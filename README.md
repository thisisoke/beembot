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

In Finder, **right-click** `setup.sh` → **Open With** → **Terminal**.

> If Terminal isn't listed, choose **Other…**, then find Terminal in Applications → Utilities.

macOS may ask _"Are you sure you want to open it?"_ — click **Open**.

The script will:
- Install Homebrew (Mac package manager) if needed
- Install the Ollama macOS app (the local LLM runner) if needed
- Import the Llama model from the included `.gguf` file
- Start the AI server
- Open BeemBot in your browser automatically

You may be asked for your Mac login **password** during installation — this is normal.

**The first run takes about 2–3 minutes.** After that it's fast.

---

## Every time after that

Just **double-click** `setup.sh` in Finder.

> If double-clicking opens a text editor instead, right-click → Open With → Terminal.

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
Right-click the file → Open With → Terminal instead of double-clicking.

**"Permission denied" during Ollama install**
The script will ask for your Mac login password to complete the install. Type your password (nothing will appear as you type) and press Enter.

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
