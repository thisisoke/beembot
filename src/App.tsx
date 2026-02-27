import { useMemo, useCallback, useState } from 'react';
import { PhoneContainer } from './components/PhoneContainer/PhoneContainer';
import { Header } from './components/Header/Header';
import { ChatWell } from './components/ChatWell/ChatWell';
import { InputBar } from './components/InputBar/InputBar';
import { PromptsPanel, type PromptValues } from './components/PromptsPanel/PromptsPanel';
import { DataFilesPanel } from './components/DataFilesPanel/DataFilesPanel';
import { useChat } from './hooks/useChat';
import { createLLMProvider } from './services/llmService';
import { MOCK_ACCOUNTS } from './data/mockData';
import './App.css';

function App() {
  const llmProvider = useMemo(() => createLLMProvider(), []);
  const { messages, selectedAccount, isLoading, sendMessage, selectAccount } = useChat(llmProvider);
  const [, setSessionPrompts] = useState<PromptValues>({});

  const handlePromptsChange = useCallback((prompts: PromptValues) => {
    setSessionPrompts(prompts);
  }, []);

  const leftPanels = (
    <>
      <PromptsPanel onPromptsChange={handlePromptsChange} />
      <DataFilesPanel />
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
