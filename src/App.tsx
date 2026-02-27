import { useMemo, useCallback, useState } from 'react';
import JSZip from 'jszip';
import { Download } from 'lucide-react';
import { PhoneContainer } from './components/PhoneContainer/PhoneContainer';
import { Header } from './components/Header/Header';
import { ChatWell } from './components/ChatWell/ChatWell';
import { InputBar } from './components/InputBar/InputBar';
import { PromptsPanel, type PromptValues } from './components/PromptsPanel/PromptsPanel';
import { DataFilesPanel, type DataFile } from './components/DataFilesPanel/DataFilesPanel';
import { Button } from './components/ui/button';
import { useChat } from './hooks/useChat';
import { createLLMProvider } from './services/llmService';
import { MOCK_ACCOUNTS } from './data/mockData';
import './App.css';

const PROMPT_FILENAMES: Record<string, string> = {
  'system-prompt': 'system-prompt.md',
  'guardrails-specs': 'guardrails-specs.md',
  'topical-conversation-guidelines': 'topical-conversation-guidelines.md',
};

function App() {
  const llmProvider = useMemo(() => createLLMProvider(), []);
  const { messages, selectedAccount, isLoading, sendMessage, selectAccount } = useChat(llmProvider);
  const [sessionPrompts, setSessionPrompts] = useState<PromptValues>({});
  const [sessionFiles, setSessionFiles] = useState<DataFile[]>([]);

  const handlePromptsChange = useCallback((prompts: PromptValues) => {
    setSessionPrompts(prompts);
  }, []);

  const handleFilesChange = useCallback((files: DataFile[]) => {
    setSessionFiles(files);
  }, []);

  const handleSaveAll = useCallback(async () => {
    const zip = new JSZip();

    // Add prompt files
    const promptsFolder = zip.folder('prompts');
    for (const [key, content] of Object.entries(sessionPrompts)) {
      const filename = PROMPT_FILENAMES[key] || `${key}.md`;
      promptsFolder?.file(filename, content);
    }

    // Add data files
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
      <PromptsPanel onPromptsChange={handlePromptsChange} />
      <DataFilesPanel onFilesChange={handleFilesChange} />
    </>
  );

  return (
    <PhoneContainer leftPanels={leftPanels}>
      <Header />
      <ChatWell
        messages={messages}
        selectedAccount={selectedAccount}
        isLoading={isLoading}
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
