import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Download } from 'lucide-react';
import { PhoneContainer } from './components/PhoneContainer/PhoneContainer';
import { Header } from './components/Header/Header';
import { ChatWell } from './components/ChatWell/ChatWell';
import { InputBar } from './components/InputBar/InputBar';
import { PromptsPanel, type PromptValues } from './components/PromptsPanel/PromptsPanel';
import { DataFilesPanel, type DataFile } from './components/DataFilesPanel/DataFilesPanel';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { useChat } from './hooks/useChat';
import { OllamaProvider, createLLMProvider } from './services/llmService';
import { MOCK_ACCOUNTS } from './data/mockData';
import type { LLMContext } from './types';
import './App.css';

const PROMPT_FILENAMES: Record<string, string> = {
  'system-prompt': 'system-prompt.md',
  'guardrails-specs': 'guardrails-specs.md',
  'topical-conversation-guidelines': 'topical-conversation-guidelines.md',
  'edge-cases': 'edge-cases.md',
};

function App() {
  // ── Ollama connection settings ──
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.1-beembot');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // ── Session data from config panels ──
  const [sessionPrompts, setSessionPrompts] = useState<PromptValues>({});
  const [sessionFiles, setSessionFiles] = useState<DataFile[]>([]);

  // ── Track whether prompt/data files changed after initial load ──
  const [promptsUpdated, setPromptsUpdated] = useState(false);
  const initialLoadDone = useRef(false);

  // ── LLM provider (recreated when connection settings change) ──
  const llmProvider = useMemo(
    () => createLLMProvider('ollama', ollamaUrl, ollamaModel),
    [ollamaUrl, ollamaModel],
  );

  // ── Build LLM context from prompts + data files ──
  const llmContext = useMemo<LLMContext>(() => {
    const systemParts = [
      sessionPrompts['system-prompt'] || '',
      sessionPrompts['guardrails-specs'] || '',
      sessionPrompts['topical-conversation-guidelines'] || '',
      sessionPrompts['edge-cases'] || '',
    ].filter(Boolean);

    return {
      systemPrompt: systemParts.join('\n\n'),
      dataFiles: sessionFiles
        .filter((f) => f.content)
        .map((f) => ({ name: f.name, content: f.content! })),
    };
  }, [sessionPrompts, sessionFiles]);

  const { messages, selectedAccount, isLoading, isStreaming, sendMessage, selectAccount, clearChat } =
    useChat(llmProvider, llmContext, promptsUpdated);

  const handleRefresh = useCallback(() => {
    clearChat();
    setPromptsUpdated(false);
  }, [clearChat]);

  // ── Test Ollama connection (debounced on URL change) ──
  useEffect(() => {
    setIsConnected(null);
    const timer = setTimeout(() => {
      OllamaProvider.testConnection(ollamaUrl).then(setIsConnected);
    }, 500);
    return () => clearTimeout(timer);
  }, [ollamaUrl]);

  const handlePromptsChange = useCallback((prompts: PromptValues) => {
    setSessionPrompts(prompts);
    if (initialLoadDone.current) {
      setPromptsUpdated(true);
    }
  }, []);

  const handleFilesChange = useCallback((files: DataFile[]) => {
    setSessionFiles(files);
    if (initialLoadDone.current) {
      setPromptsUpdated(true);
    }
  }, []);

  // Mark initial load as done after both panels have loaded
  useEffect(() => {
    if (Object.keys(sessionPrompts).length > 0 && !initialLoadDone.current) {
      // Small delay to let both panels finish their initial load
      const timer = setTimeout(() => { initialLoadDone.current = true; }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionPrompts]);

  const handleSaveAll = useCallback(async () => {
    const zip = new JSZip();

    const promptsFolder = zip.folder('prompts');
    for (const [key, content] of Object.entries(sessionPrompts)) {
      const filename = PROMPT_FILENAMES[key] || `${key}.md`;
      promptsFolder?.file(filename, content);
    }

    const dataFolder = zip.folder('data-and-files');
    for (const file of sessionFiles) {
      if (file.content) {
        dataFolder?.file(file.name, file.content);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beembot-config.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionPrompts, sessionFiles]);

  const leftPanels = (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <span className="text-xs font-medium text-white/70">Configuration</span>
        <Button size="sm" variant="secondary" onClick={handleSaveAll}>
          <Download size={14} />
          Save
        </Button>
      </div>

      {/* Ollama connection settings */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            {isConnected === null ? (
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            ) : isConnected ? (
              <div className="w-2 h-2 rounded-full bg-green-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-red-400" />
            )}
            <span className="text-xs font-medium">
              {isConnected === null
                ? 'Checking connection...'
                : isConnected
                  ? 'Connected to Ollama'
                  : 'Ollama not reachable'}
            </span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Model
              </label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-xs bg-background border rounded-md"
                placeholder="llama3.1:8b"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Server URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-xs bg-background border rounded-md"
                placeholder="http://localhost:11434"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <PromptsPanel onPromptsChange={handlePromptsChange} />
      <DataFilesPanel onFilesChange={handleFilesChange} />
    </>
  );

  return (
    <PhoneContainer leftPanels={leftPanels}>
      <Header
        onRefresh={handleRefresh}
        toast={promptsUpdated && messages.length > 0 ? 'Prompt files updated — refresh chat for clean testing' : null}
      />
      <ChatWell
        messages={messages}
        selectedAccount={selectedAccount}
        isLoading={isLoading && !isStreaming}
        accounts={MOCK_ACCOUNTS}
        onSelectAccount={selectAccount}
      />
      <InputBar
        onSend={sendMessage}
        isLoading={isLoading}
        selectedAccount={selectedAccount}
      />
    </PhoneContainer>
  );
}

export default App;
