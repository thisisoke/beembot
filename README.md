# BeemBot

A local AI chat interface for configuring and testing financial assistant behaviour. Includes system prompt management, data file uploads, multi-account support, and configuration export.

> **No installation required to run.** Just download and open a file.

---

## Running the App (No Setup Required)

### Step 1 — Download the repo

Click the green **Code** button on GitHub → **Download ZIP**, then unzip it.

Or if you have Git:
```bash
git clone https://github.com/thisisoke/beembot.git
cd beembot
```

### Step 2 — Open the app

Navigate into the `dist/` folder and open `index.html` in your browser.

That's it. No Node.js, no npm, no terminal needed.

---

## Connecting to a Local LLM (Ollama)

BeemBot talks to a locally running LLM via Ollama. You will need to set this up once.

### Install Ollama

Download and install from [https://ollama.com/download](https://ollama.com/download).

### Pull the model

Open your terminal and run:
```bash
ollama pull llama3.1:8b
```

This downloads the model (~5GB). Only needs to be done once.

### Start Ollama

```bash
ollama serve
```

Ollama runs at `http://localhost:11434` by default.

### Connect BeemBot

In the app's Configuration panel, set the Server URL to:

```
http://localhost:11434
```

The status indicator will turn green when the connection is live.

---

## Troubleshooting

**"Ollama not reachable"**
Make sure `ollama serve` is running in a terminal. If it started on a different port, update the Server URL field in the app to match.

**The app looks broken or blank**
Make sure you're opening `dist/index.html`, not `index.html` from the root of the project.

**Model is slow**
`llama3.1:8b` requires ~8GB of RAM. If your machine is struggling, try a smaller model:
```bash
ollama pull llama3.2:3b
```
Then update the Model field in the Configuration panel to `llama3.2:3b`.

---

## For Developers

If you want to modify the source code, you'll need Node.js and npm.

```bash
npm install
npm run dev      # start dev server at localhost:5173
npm run build    # rebuild the dist/ folder
```

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI.
