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
 * LLM Provider interface — swap implementations to connect a local LLM.
 */
export interface LLMProvider {
  sendMessage(userMessage: string, history: ChatMessage[]): Promise<string>;
}
