import { useState, type FormEvent, type ChangeEvent } from 'react';
import type { Account } from '../../types';
import './InputBar.css';

const MAX_CHARS = 1000;

interface InputBarProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  selectedAccount: Account | null;
  onToggleAccountSelector?: () => void;
}

export function InputBar({ onSend, isLoading, selectedAccount, onToggleAccountSelector }: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setValue(e.target.value);
    }
  };

  return (
    <div className="input-bar-wrapper">
      {/* Account bar */}
      <button className="account-bar" onClick={onToggleAccountSelector} type="button">
        <span className="account-bar-label">
          {selectedAccount
            ? `${selectedAccount.name} ${selectedAccount.type} ****${selectedAccount.lastFour}`
            : 'Select Account'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Text input */}
      <form className="input-bar" onSubmit={handleSubmit}>
        <div className="input-field-wrapper">
          <input
            className="input-field"
            type="text"
            placeholder="Ask a question"
            value={value}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="input-actions">
            <button type="button" className="input-icon-btn" aria-label="Attach file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a7a8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button type="button" className="input-icon-btn" aria-label="Voice input">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a7a8e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            {value.trim() ? (
              <button type="submit" className="input-send-btn" disabled={isLoading} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            ) : (
              <button type="button" className="input-icon-btn" aria-label="Audio">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a7a8e" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="6" width="4" height="12" rx="1" />
                  <rect x="7" y="3" width="4" height="18" rx="1" />
                  <rect x="12" y="8" width="4" height="8" rx="1" />
                  <rect x="17" y="5" width="4" height="14" rx="1" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="input-char-count">
          {value.length}/{MAX_CHARS}
        </div>
      </form>
    </div>
  );
}
