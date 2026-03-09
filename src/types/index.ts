export interface Account {
  id: string;
  name: string;
  type: string;
  lastFour: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Rich content like account selection prompts */
  attachment?: MessageAttachment;
  /** Shown when prompt/data files were updated before this message */
  promptsUpdatedBadge?: boolean;
}

export type MessageAttachment =
  | { type: 'account-selector'; accounts: Account[] }
  | { type: 'account-selected'; account: Account };

export interface ChatState {
  messages: ChatMessage[];
  selectedAccount: Account | null;
  isAccountSelectorOpen: boolean;
  isLoading: boolean;
}

/**
 * Context passed to the LLM with each request — assembled from the
 * configuration panels (prompts, data files, selected account).
 */
export interface LLMContext {
  systemPrompt: string;
  dataFiles: { name: string; content: string }[];
  selectedAccount?: Account | null;
}

/**
 * LLM Provider interface — swap implementations to connect a local LLM.
 */
export interface LLMProvider {
  sendMessage(
    userMessage: string,
    history: ChatMessage[],
    context?: LLMContext,
  ): Promise<string>;

  /** Optional streaming variant — called when available. */
  sendMessageStream?(
    userMessage: string,
    history: ChatMessage[],
    context: LLMContext,
    onToken: (token: string) => void,
  ): Promise<string>;
}
