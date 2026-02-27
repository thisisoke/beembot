import { useState, useCallback, useRef } from 'react';
import type { Account, ChatMessage, LLMProvider } from '../types';

export function useChat(llmProvider: LLMProvider) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(0);

  const nextId = () => String(++idCounter.current);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: nextId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const updatedHistory = [...messages, userMsg];
        const response = await llmProvider.sendMessage(content.trim(), updatedHistory);

        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        const errorMsg: ChatMessage = {
          id: nextId(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        console.error('LLM error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, llmProvider]
  );

  const selectAccount = useCallback((account: Account) => {
    setSelectedAccount(account);

    const selectionMsg: ChatMessage = {
      id: nextId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      attachment: { type: 'account-selected', account },
    };
    setMessages((prev) => [...prev, selectionMsg]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSelectedAccount(null);
    idCounter.current = 0;
  }, []);

  return {
    messages,
    selectedAccount,
    isLoading,
    sendMessage,
    selectAccount,
    clearChat,
  };
}
