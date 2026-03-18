import { useState, type FormEvent, type ChangeEvent } from 'react';
import './InputBar.css';

const MAX_CHARS = 1000;

interface InputBarProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function InputBar({ onSend, isLoading }: InputBarProps) {
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
          {value.trim() && (
            <button type="submit" className="input-send-btn" disabled={isLoading} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
        <div className="input-char-count">
          {value.length}/{MAX_CHARS}
        </div>
      </form>
    </div>
  );
}
