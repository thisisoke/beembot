import { useEffect, useRef } from 'react';
import type { Account, ChatMessage } from '../../types';
import { AccountSelector } from '../AccountSelector/AccountSelector';
import './ChatWell.css';

interface ChatWellProps {
  messages: ChatMessage[];
  selectedAccount: Account | null;
  isLoading: boolean;
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
}

function renderBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatWell({ messages, selectedAccount, isLoading, accounts, onSelectAccount }: ChatWellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="chat-well" ref={scrollRef}>
      <div className="chat-well-inner">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message--${msg.role}`}>
            {msg.role === 'user' ? (
              <div className="message-bubble user-bubble">
                {msg.content}
              </div>
            ) : (
              <div className="message-surface">
                {msg.content && (
                  <div className="ai-text">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i}>{renderBoldText(line)}</p>
                    ))}
                  </div>
                )}
                {msg.attachment?.type === 'account-selector' && !selectedAccount && (
                  <AccountSelector
                    accounts={accounts}
                    selectedAccount={selectedAccount}
                    onSelect={onSelectAccount}
                  />
                )}
                {msg.attachment?.type === 'account-selected' && (
                  <div className="account-selected-card">
                    <span className="account-selected-label">Account Selected</span>
                    <div className="account-selected-info">
                      <div className="account-selected-details">
                        <span className="account-selected-name">
                          {msg.attachment.account.name}
                        </span>
                        <span className="account-selected-type">
                          {msg.attachment.account.type} ****{msg.attachment.account.lastFour}
                        </span>
                      </div>
                      <svg className="account-selected-check" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="11" fill="#1565c0" />
                        <polyline points="7 12 10 15 17 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message message--assistant">
            <div className="message-surface">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
