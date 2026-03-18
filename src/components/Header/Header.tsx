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
        <button className="header-icon-btn" aria-label="Download transcript" onClick={onShare} title="Download chat transcript">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
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
