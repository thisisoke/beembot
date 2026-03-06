# BeemBot

A local AI assistant for financial advisors. Configure a system prompt, load client data, and chat with a locally running LLM — nothing leaves your machine.

---

## What you need before starting

- **Ollama** installed — download from [https://ollama.com/download](https://ollama.com/download)
- The model pulled — run this once in your terminal:

```
ollama pull llama3:latest
```

(~5GB download, only needed once)

---

## Running the app

### Step 1 — Download this repo

Click the green **Code** button → **Download ZIP**, then unzip it anywhere on your computer.

### Step 2 — Start Ollama

Open a terminal and run:

```
ollama serve
```

Leave this terminal open. Ollama is now running at `http://localhost:11434`.

### Step 3 — Start the app

Open a **second terminal**, navigate into the `dist/` folder inside the repo you downloaded, and run:

```
cd path/to/beembot/dist
python3 -m http.server 8080
```

Then open your browser and go to:

```
http://localhost:8080
```

That's it. BeemBot is running.

---

## Inside the app

- **Server URL** — should already be set to `http://localhost:11434`. If the status says "Ollama not reachable", make sure `ollama serve` is still running.
- **Model** — set to `llama3.1:8b` by default. If your machine is slow or low on RAM, try `llama3.2:3b` instead (run `ollama pull llama3.2:3b` first).
- **System Prompt** — paste your assistant instructions here.
- **Data & Files** — upload CSV, JSON, or markdown files to give the assistant context about a client or portfolio.

---

## Troubleshooting

**Blank page when I open index.html directly**
Don't double-click the file. Use the `python3 -m http.server 8080` command above instead.

**"Ollama not reachable"**
Make sure `ollama serve` is running in a separate terminal window. Don't close it.

**Model is very slow**
`llama3.1:8b` needs ~8GB RAM. Switch to a lighter model:

```
ollama pull llama3.2:3b
```

Then change the Model field in the app to `llama3.2:3b`.

**Port 8080 already in use**
Change the port number: `python3 -m http.server 3000` and visit `http://localhost:3000` instead.

---

## For developers

Source code and dev environment lives on the `dev` branch:

```
git checkout dev
npm install
npm run dev
```

When you're ready to ship an update:

```
npm run build
git checkout main
cp -r dist/ ../beembot-main/dist/ # copy built files to main
```

Or use the Claude Code build instructions in the dev branch.
