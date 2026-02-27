import { useMemo } from 'react';
import { PhoneContainer } from './components/PhoneContainer/PhoneContainer';
import { Header } from './components/Header/Header';
import { ChatWell } from './components/ChatWell/ChatWell';
import { InputBar } from './components/InputBar/InputBar';
import { useChat } from './hooks/useChat';
import { createLLMProvider } from './services/llmService';
import { MOCK_ACCOUNTS } from './data/mockData';
import './App.css';

function App() {
  const llmProvider = useMemo(() => createLLMProvider(), []);
  const { messages, selectedAccount, isLoading, sendMessage, selectAccount } = useChat(llmProvider);

  return (
    <PhoneContainer>
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
