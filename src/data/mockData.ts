import type { Account, ChatMessage } from '../types';

export const MOCK_ACCOUNTS: Account[] = [
  { id: '1', name: "Sammy's Savings", type: 'TFSA', lastFour: '0052' },
  { id: '2', name: "Carl's Money", type: 'RRSP', lastFour: '0052' },
  { id: '3', name: 'XYDHF-HJFKDS-JSDITE-RTMNA', type: 'Acct Type', lastFour: '0052' },
  { id: '4', name: 'Special Investments', type: 'RRSP', lastFour: '0052' },
];

export const MOCK_CONVERSATION: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you show me buy ideas?',
    timestamp: new Date(),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Absolutely, Sam. Which account would you like to use?',
    timestamp: new Date(),
    attachment: { type: 'account-selector', accounts: MOCK_ACCOUNTS },
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'Great. What are you interested in investing in right now? I can help you explore buy ideas for **stocks, ETFs, GICs, or bonds.**',
    timestamp: new Date(),
  },
  {
    id: '4',
    role: 'user',
    content: "Let's do stocks",
    timestamp: new Date(),
  },
  {
    id: '5',
    role: 'assistant',
    content:
      'Perfect. Here are **five stock buy ideas** selected using the default rating criteria.\n\nThese options stand out based on their fundamentals and overall analyst assessment.',
    timestamp: new Date(),
  },
];
