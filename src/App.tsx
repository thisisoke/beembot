import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { NavigationPanel } from './components/NavigationPanel/NavigationPanel';
import { DocumentPreview, type DocumentTab } from './components/DocumentPreview/DocumentPreview';
import { Header } from './components/Header/Header';
import { ChatWell } from './components/ChatWell/ChatWell';
import { InputBar } from './components/InputBar/InputBar';
import type { PromptValues } from './components/PromptsPanel/PromptsPanel';
import type { DataFile } from './components/DataFilesPanel/DataFilesPanel';
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

const PROMPT_SECTIONS = [
  { key: 'system-prompt', label: 'System Prompt', filename: 'system-prompt.md' },
  { key: 'guardrails-specs', label: 'Guardrails Specs', filename: 'guardrails-specs.md' },
  {
    key: 'topical-conversation-guidelines',
    label: 'Topical Conversation Guidelines',
    filename: 'topical-conversation-guidelines.md',
  },
  { key: 'edge-cases', label: 'Edge Case Library', filename: 'edge-cases.md' },
];

function App() {
  // ── Ollama connection settings ──
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.1-beembot');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // ── Session data ──
  const [sessionPrompts, setSessionPrompts] = useState<PromptValues>({});
  const [sessionFiles, setSessionFiles] = useState<DataFile[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);

  // ── Saved prompts snapshot (what's "committed" in the session) ──
  const [savedPrompts, setSavedPrompts] = useState<PromptValues>({});

  // ── Track which prompts have unsaved changes ──
  const [dirtyPrompts, setDirtyPrompts] = useState<Set<string>>(new Set());

  // ── Track whether prompt/data files have been updated after save ──
  const [promptsUpdated, setPromptsUpdated] = useState(false);

  // ── Navigation panel section toggles ──
  const [promptsExpanded, setPromptsExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(true);

  // ── Document tabs ──
  const [openTabs, setOpenTabs] = useState<DocumentTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // ── Save toast ──
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const saveToastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── LLM provider ──
  const llmProvider = useMemo(
    () => createLLMProvider('ollama', ollamaUrl, ollamaModel),
    [ollamaUrl, ollamaModel],
  );

  // ── Build LLM context from saved prompts + data files ──
  const llmContext = useMemo<LLMContext>(() => {
    const systemParts = [
      savedPrompts['system-prompt'] || '',
      savedPrompts['guardrails-specs'] || '',
      savedPrompts['topical-conversation-guidelines'] || '',
      savedPrompts['edge-cases'] || '',
    ].filter(Boolean);

    return {
      systemPrompt: systemParts.join('\n\n'),
      dataFiles: sessionFiles
        .filter((f) => f.content)
        .map((f) => ({ name: f.name, content: f.content! })),
    };
  }, [savedPrompts, sessionFiles]);

  const { messages, selectedAccount, isLoading, isStreaming, sendMessage, selectAccount, clearChat } =
    useChat(llmProvider, llmContext);

  const handleRefresh = useCallback(() => {
    clearChat();
    setPromptsUpdated(false);
  }, [clearChat]);

  // ── Test Ollama connection ──
  useEffect(() => {
    setIsConnected(null);
    const timer = setTimeout(() => {
      OllamaProvider.testConnection(ollamaUrl).then(setIsConnected);
    }, 500);
    return () => clearTimeout(timer);
  }, [ollamaUrl]);

  // ── Load prompts on mount ──
  useEffect(() => {
    async function loadPrompts() {
      const loaded: PromptValues = {};
      for (const section of PROMPT_SECTIONS) {
        try {
          const res = await fetch(`/prompts/${section.filename}`);
          if (res.ok) {
            loaded[section.key] = await res.text();
          } else {
            loaded[section.key] = `# ${section.label}\n\nAdd your ${section.label.toLowerCase()} here...`;
          }
        } catch {
          loaded[section.key] = `# ${section.label}\n\nAdd your ${section.label.toLowerCase()} here...`;
        }
      }
      setSessionPrompts(loaded);
      setSavedPrompts(loaded);
      setPromptsLoading(false);
    }
    loadPrompts();
  }, []);

  // ── Load data files on mount ──
  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch('/data-and-files/manifest.json');
        if (res.ok) {
          const manifest: DataFile[] = await res.json();
          const filesWithContent = await Promise.all(
            manifest.map(async (file) => {
              try {
                const contentRes = await fetch(`/data-and-files/${file.name}`);
                if (contentRes.ok) {
                  return { ...file, content: await contentRes.text() };
                }
              } catch {
                // Content fetch failed
              }
              return file;
            }),
          );
          setSessionFiles(filesWithContent);
        }
      } catch {
        // Manifest not available
      }
      setFilesLoading(false);
    }
    loadManifest();
  }, []);

  // ── Handle prompt changes (from document editor) ──
  const handlePromptChange = useCallback((key: string, value: string) => {
    setSessionPrompts((prev) => ({ ...prev, [key]: value }));
    setDirtyPrompts((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // ── Save a specific prompt ──
  const handleSavePrompt = useCallback((key: string) => {
    setSavedPrompts((prev) => {
      const next = { ...prev };
      // Get the latest session value
      setSessionPrompts((current) => {
        next[key] = current[key];
        return current;
      });
      return next;
    });
    // A more reliable approach: read sessionPrompts directly
    setSessionPrompts((current) => {
      setSavedPrompts((prev) => ({ ...prev, [key]: current[key] }));
      return current;
    });
    setDirtyPrompts((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setPromptsUpdated(true);
    // Show save toast
    setSaveToastVisible(true);
    if (saveToastTimer.current) clearTimeout(saveToastTimer.current);
    saveToastTimer.current = setTimeout(() => setSaveToastVisible(false), 3000);
  }, []);

  // ── Handle file upload from navigation panel ──
  const handleUploadFiles = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setSessionFiles((prev) => {
          const exists = prev.findIndex((f) => f.name === file.name);
          const newFile: DataFile = {
            name: file.name,
            description: 'Uploaded file',
            isUploaded: true,
            content,
          };
          return exists >= 0
            ? prev.map((f, i) => (i === exists ? newFile : f))
            : [...prev, newFile];
        });
      };
      reader.readAsText(file);
    });
  }, []);

  // ── Handle file download ──
  const handleDownloadFile = useCallback((file: DataFile) => {
    if (file.isUploaded && file.content) {
      const blob = new Blob([file.content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = `/data-and-files/${file.name}`;
      a.download = file.name;
      a.click();
    }
  }, []);

  // ── Download all prompts as ZIP ──
  const handleDownloadAllPrompts = useCallback(async () => {
    const zip = new JSZip();
    for (const [key, content] of Object.entries(sessionPrompts)) {
      const filename = PROMPT_FILENAMES[key] || `${key}.md`;
      zip.file(filename, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beembot-prompts.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionPrompts]);

  // ── Download all sources as ZIP ──
  const handleDownloadAllSources = useCallback(async () => {
    const zip = new JSZip();
    for (const file of sessionFiles) {
      if (file.content) {
        zip.file(file.name, file.content);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beembot-sources.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionFiles]);

  // ── Download chat transcript as .txt ──
  const handleShareTranscript = useCallback(() => {
    if (messages.length === 0) return;
    const lines = messages.map((msg) => {
      const role = msg.role === 'user' ? 'You' : 'BeemBot';
      return `${role}: ${msg.content}`;
    });
    const transcript = lines.join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beembot-chat-transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  // ── Open a prompt in the document preview ──
  const handleOpenPrompt = useCallback(
    (key: string) => {
      const tabId = `prompt-${key}`;
      const existing = openTabs.find((t) => t.id === tabId);
      if (!existing) {
        const section = PROMPT_SECTIONS.find((s) => s.key === key);
        const tab: DocumentTab = {
          id: tabId,
          label: section?.label || key,
          type: 'prompt',
          content: sessionPrompts[key] || '',
          promptKey: key,
        };
        setOpenTabs((prev) => [...prev, tab]);
      }
      setActiveTabId(tabId);
    },
    [openTabs, sessionPrompts],
  );

  // ── Open a source file in the document preview ──
  const handleOpenSource = useCallback(
    (file: DataFile) => {
      const tabId = `source-${file.name}`;
      const existing = openTabs.find((t) => t.id === tabId);
      if (!existing) {
        const tab: DocumentTab = {
          id: tabId,
          label: file.name,
          type: 'source',
          content: file.content || '(No content available)',
        };
        setOpenTabs((prev) => [...prev, tab]);
      }
      setActiveTabId(tabId);
    },
    [openTabs],
  );

  // ── Close a document tab ──
  const handleCloseTab = useCallback(
    (tabId: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t.id !== tabId);
        if (activeTabId === tabId) {
          const closedIdx = prev.findIndex((t) => t.id === tabId);
          const newActive = next[Math.min(closedIdx, next.length - 1)]?.id || null;
          setActiveTabId(newActive);
        }
        return next;
      });
    },
    [activeTabId],
  );

  // ── Handle content changes in the document editor ──
  const handleDocContentChange = useCallback(
    (_tabId: string, promptKey: string, content: string) => {
      handlePromptChange(promptKey, content);
      // Update the tab content to keep it in sync
      setOpenTabs((prev) =>
        prev.map((t) => (t.promptKey === promptKey ? { ...t, content } : t)),
      );
    },
    [handlePromptChange],
  );

  // Keep prompt tabs in sync when sessionPrompts change externally
  useEffect(() => {
    setOpenTabs((prev) =>
      prev.map((tab) => {
        if (tab.type === 'prompt' && tab.promptKey && sessionPrompts[tab.promptKey] !== undefined) {
          return { ...tab, content: sessionPrompts[tab.promptKey] };
        }
        return tab;
      }),
    );
  }, [sessionPrompts]);

  // Keep source tabs in sync
  useEffect(() => {
    setOpenTabs((prev) =>
      prev.map((tab) => {
        if (tab.type === 'source') {
          const file = sessionFiles.find((f) => `source-${f.name}` === tab.id);
          if (file && file.content && file.content !== tab.content) {
            return { ...tab, content: file.content };
          }
        }
        return tab;
      }),
    );
  }, [sessionFiles]);

  return (
    <div className="app-layout">
      {/* Left: Navigation Panel */}
      <NavigationPanel
        isConnected={isConnected}
        ollamaModel={ollamaModel}
        ollamaUrl={ollamaUrl}
        onModelChange={setOllamaModel}
        onUrlChange={setOllamaUrl}
        prompts={sessionPrompts}
        promptsLoading={promptsLoading}
        onOpenPrompt={handleOpenPrompt}
        onDownloadAllPrompts={handleDownloadAllPrompts}
        onSavePrompt={handleSavePrompt}
        dirtyPrompts={dirtyPrompts}
        dataFiles={sessionFiles}
        filesLoading={filesLoading}
        onOpenSource={handleOpenSource}
        onUploadFiles={handleUploadFiles}
        onDownloadFile={handleDownloadFile}
        onDownloadAllSources={handleDownloadAllSources}
        activeDocId={activeTabId}
        promptsExpanded={promptsExpanded}
        sourcesExpanded={sourcesExpanded}
        onTogglePrompts={() => setPromptsExpanded((p) => !p)}
        onToggleSources={() => setSourcesExpanded((p) => !p)}
      />

      {/* Center: Document Preview */}
      <div className="app-center-panel">
        <DocumentPreview
          tabs={openTabs}
          activeTabId={activeTabId}
          onActivateTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onContentChange={handleDocContentChange}
        />
      </div>

      {/* Right: Chat Panel */}
      <div className="app-chat-panel">
        <Header onRefresh={handleRefresh} onShare={handleShareTranscript} />
        {(promptsUpdated || saveToastVisible) && (
          <div className="prompt-updated-toast" onClick={handleRefresh}>
            {saveToastVisible
              ? 'Prompts saved — refresh chat for clean testing'
              : 'Prompt files updated — refresh chat for clean testing'}
          </div>
        )}
        <ChatWell
          messages={messages}
          selectedAccount={selectedAccount}
          isLoading={isLoading && !isStreaming}
          accounts={MOCK_ACCOUNTS}
          onSelectAccount={selectAccount}
          promptsUpdated={promptsUpdated}
        />
        <InputBar
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
