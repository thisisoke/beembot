import './Header.css';

interface HeaderProps {
  onRefresh?: () => void;
  onShare?: () => void;
}

export function Header({ onRefresh, onShare }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header-title">BeemBot Preview</h1>
      <div className="header-right">
        <button className="header-icon-btn" aria-label="Share" onClick={onShare} title="Share chat transcript">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
        <button className="header-icon-btn" aria-label="Refresh chat" onClick={onRefresh} title="Clear chat and refresh with latest prompts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
