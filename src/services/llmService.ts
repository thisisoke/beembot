import type { ChatMessage, LLMProvider } from '../types';

/**
 * Mock LLM provider — returns canned responses for demo purposes.
 *
 * To connect a real local LLM (e.g. Ollama, llama.cpp, LM Studio),
 * create a new class implementing LLMProvider and pass it to useChat().
 *
 * Example for Ollama:
 *
 *   class OllamaProvider implements LLMProvider {
 *     private baseUrl: string;
 *     constructor(baseUrl = 'http://localhost:11434') {
 *       this.baseUrl = baseUrl;
 *     }
 *     async sendMessage(userMessage: string, history: ChatMessage[]): Promise<string> {
 *       const res = await fetch(`${this.baseUrl}/api/chat`, {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify({
 *           model: 'llama3',
 *           messages: history.map(m => ({ role: m.role, content: m.content })),
 *           stream: false,
 *         }),
 *       });
 *       const data = await res.json();
 *       return data.message.content;
 *     }
 *   }
 */

const MOCK_RESPONSES = [
  'Absolutely, Sam. Which account would you like to use?',
  'Great. What are you interested in investing in right now? I can help you explore buy ideas for **stocks, ETFs, GICs, or bonds.**',
  'Perfect. Here are **five stock buy ideas** selected using the default rating criteria.\n\nThese options stand out based on their fundamentals and overall analyst assessment.',
  "I'd recommend looking into diversified ETFs for a balanced portfolio approach.",
  "Based on current market conditions, here are some options worth considering.",
];

export class MockLLMProvider implements LLMProvider {
  private responseIndex = 0;

  async sendMessage(_userMessage: string, _history: ChatMessage[]): Promise<string> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));
    const response = MOCK_RESPONSES[this.responseIndex % MOCK_RESPONSES.length];
    this.responseIndex++;
    return response;
  }
}

/**
 * ── INTEGRATION POINT ──
 * Replace MockLLMProvider with your local LLM provider here.
 * The rest of the app consumes this via the useChat hook.
 */
export function createLLMProvider(): LLMProvider {
  // TODO: Replace with real provider, e.g.:
  // return new OllamaProvider('http://localhost:11434');
  return new MockLLMProvider();
}
