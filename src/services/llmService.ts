import type { ChatMessage, LLMContext, LLMProvider } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────

/** Build the Ollama-format messages array from chat history + context. */
function buildOllamaMessages(
  userMessage: string,
  history: ChatMessage[],
  context?: LLMContext,
): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = [];

  if (context) {
    let systemContent = context.systemPrompt || '';

    // Append reference data so the model can ground responses
    const filesWithContent = context.dataFiles.filter((f) => f.content);
    if (filesWithContent.length > 0) {
      systemContent +=
        '\n\n## Reference Data\nUse the following data to ground your responses:\n';
      for (const file of filesWithContent) {
        systemContent += `\n### ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`;
      }
    }

    // Add selected-account context
    if (context.selectedAccount) {
      const a = context.selectedAccount;
      systemContent += `\n\n## Current Session Context\nThe user has selected account: ${a.name} (${a.type} ****${a.lastFour})`;
    }

    if (systemContent.trim()) {
      messages.push({ role: 'system', content: systemContent });
    }
  }

  // Conversation history (skip empty-content attachment-only messages)
  for (const msg of history) {
    if (msg.content) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

// ── Mock Provider ────────────────────────────────────────────────────

const MOCK_RESPONSES = [
  'Absolutely, Sam. Which account would you like to use?',
  'Great. What are you interested in investing in right now? I can help you explore buy ideas for **stocks, ETFs, GICs, or bonds.**',
  'Perfect. Here are **five stock buy ideas** selected using the default rating criteria.\n\nThese options stand out based on their fundamentals and overall analyst assessment.',
  "I'd recommend looking into diversified ETFs for a balanced portfolio approach.",
  "Based on current market conditions, here are some options worth considering.",
];

export class MockLLMProvider implements LLMProvider {
  private responseIndex = 0;

  async sendMessage(
    _userMessage: string,
    _history: ChatMessage[],
    _context?: LLMContext,
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));
    const response = MOCK_RESPONSES[this.responseIndex % MOCK_RESPONSES.length];
    this.responseIndex++;
    return response;
  }
}

// ── Ollama Provider ──────────────────────────────────────────────────

export class OllamaProvider implements LLMProvider {
  constructor(
    private baseUrl: string = 'http://localhost:11434',
    private model: string = 'llama3.1:8b',
  ) {}

  // Non-streaming fallback
  async sendMessage(
    userMessage: string,
    history: ChatMessage[],
    context?: LLMContext,
  ): Promise<string> {
    const messages = buildOllamaMessages(userMessage, history, context);
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: false }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Ollama ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data.message.content;
  }

  // Streaming — reads NDJSON line-by-line and calls onToken per chunk
  async sendMessageStream(
    userMessage: string,
    history: ChatMessage[],
    context: LLMContext,
    onToken: (token: string) => void,
  ): Promise<string> {
    const messages = buildOllamaMessages(userMessage, history, context);
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: true }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Ollama ${res.status}: ${body}`);
    }

    if (!res.body) throw new Error('No response body from Ollama');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep the last potentially-incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            fullContent += data.message.content;
            onToken(data.message.content);
          }
        } catch {
          // skip malformed fragments
        }
      }
    }

    // flush remaining buffer
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer);
        if (data.message?.content) {
          fullContent += data.message.content;
          onToken(data.message.content);
        }
      } catch {
        // skip
      }
    }

    return fullContent;
  }

  /** Quick connectivity check against /api/tags */
  static async testConnection(baseUrl: string): Promise<boolean> {
    try {
      const res = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

// ── Factory ──────────────────────────────────────────────────────────

export function createLLMProvider(
  mode: 'mock' | 'ollama' = 'ollama',
  baseUrl?: string,
  model?: string,
): LLMProvider {
  if (mode === 'ollama') {
    return new OllamaProvider(baseUrl, model);
  }
  return new MockLLMProvider();
}
