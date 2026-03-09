import { useState, useCallback, useRef } from 'react';
import type { Account, ChatMessage, LLMContext, LLMProvider } from '../types';

export function useChat(llmProvider: LLMProvider, context?: LLMContext, promptsUpdated = false) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const idCounter = useRef(0);

  // Keep a ref to the latest context so the sendMessage callback always reads
  // the current value, even if the useCallback closure hasn't been recreated yet
  // (e.g. prompts load asynchronously after mount).
  const contextRef = useRef(context);
  contextRef.current = context;

  const promptsUpdatedRef = useRef(promptsUpdated);
  promptsUpdatedRef.current = promptsUpdated;

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

      const assistantMsgId = nextId();

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const updatedHistory = [...messages, userMsg];

        // Enrich context with the currently selected account — read from the ref
        // to guarantee we always have the latest context (avoids stale closure).
        const currentContext = contextRef.current;
        const enrichedContext = currentContext
          ? { ...currentContext, selectedAccount }
          : undefined;

        if (llmProvider.sendMessageStream && enrichedContext) {
          // ── Streaming path ──
          // Typing indicator stays visible until the first token arrives,
          // then switches to the live-updating message bubble.
          let streamStarted = false;

          await llmProvider.sendMessageStream(
            content.trim(),
            updatedHistory,
            enrichedContext,
            (token: string) => {
              if (!streamStarted) {
                streamStarted = true;
                setIsStreaming(true);
                // Create the assistant message with the first token
                setMessages((prev) => [
                  ...prev,
                  {
                    id: assistantMsgId,
                    role: 'assistant' as const,
                    content: token,
                    timestamp: new Date(),
                    promptsUpdatedBadge: promptsUpdatedRef.current,
                  },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: msg.content + token }
                      : msg,
                  ),
                );
              }
            },
          );
        } else {
          // ── Non-streaming fallback ──
          const response = await llmProvider.sendMessage(
            content.trim(),
            updatedHistory,
            enrichedContext,
          );

          const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            promptsUpdatedBadge: promptsUpdatedRef.current,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch (error) {
        const errorContent =
          error instanceof TypeError
            ? "Could not connect to Ollama. Make sure it's running and the URL is correct."
            : error instanceof Error
              ? error.message
              : 'Sorry, something went wrong. Please try again.';

        setMessages((prev) => {
          const existing = prev.find((m) => m.id === assistantMsgId);
          if (existing && existing.content) {
            // Streaming was in progress — append error after partial content
            return prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + '\n\n[Error: ' + errorContent + ']' }
                : m,
            );
          }
          if (existing) {
            // Empty streaming placeholder — replace with error
            return prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: errorContent } : m,
            );
          }
          // No placeholder yet — add error message
          return [
            ...prev,
            {
              id: assistantMsgId,
              role: 'assistant' as const,
              content: errorContent,
              timestamp: new Date(),
            },
          ];
        });
        console.error('LLM error:', error);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [messages, isLoading, llmProvider, selectedAccount],
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
    isStreaming,
    sendMessage,
    selectAccount,
    clearChat,
  };
}
