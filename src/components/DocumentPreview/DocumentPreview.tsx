import { useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import './DocumentPreview.css';

export interface DocumentTab {
  id: string;
  label: string;
  type: 'prompt' | 'source';
  content: string;
  /** For prompts: the key used to update content */
  promptKey?: string;
}

interface DocumentPreviewProps {
  tabs: DocumentTab[];
  activeTabId: string | null;
  onActivateTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onContentChange?: (tabId: string, promptKey: string, content: string) => void;
}

function renderCsvTable(content: string) {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return null;

  // Simple CSV parse: split by comma, respecting basic quoting
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return (
    <div className="doc-table-wrapper">
      <table className="doc-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderJsonContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    const formatted = JSON.stringify(parsed, null, 2);
    return (
      <pre className="doc-json-view">{formatted}</pre>
    );
  } catch {
    return <pre className="doc-json-view">{content}</pre>;
  }
}

function renderContent(tab: DocumentTab, onContentChange?: (tabId: string, promptKey: string, content: string) => void) {
  // For prompts, render an editable textarea
  if (tab.type === 'prompt') {
    return (
      <textarea
        className="doc-editor"
        value={tab.content}
        onChange={(e) => onContentChange?.(tab.id, tab.promptKey || tab.id, e.target.value)}
        spellCheck={false}
      />
    );
  }

  // For source files, render based on file type
  const name = tab.label.toLowerCase();
  if (name.endsWith('.csv')) {
    return renderCsvTable(tab.content);
  }
  if (name.endsWith('.json')) {
    return renderJsonContent(tab.content);
  }

  // Default: render as preformatted text
  return <pre className="doc-text-view">{tab.content}</pre>;
}

export function DocumentPreview({ tabs, activeTabId, onActivateTab, onCloseTab, onContentChange }: DocumentPreviewProps) {
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (!tabBarRef.current || !activeTabId) return;
    const activeEl = tabBarRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTabId]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (tabBarRef.current) {
      tabBarRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (tabs.length === 0) {
    return (
      <div className="doc-preview-panel">
        <div className="doc-empty-state">
          <div className="doc-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="doc-empty-title">No document selected</p>
          <p className="doc-empty-subtitle">Click a prompt or source file in the navigation panel to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-preview-panel">
      {/* Tab bar */}
      <div className="doc-tab-bar" ref={tabBarRef} onWheel={handleWheel}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            className={`doc-tab ${tab.id === activeTabId ? 'doc-tab--active' : ''}`}
            onClick={() => onActivateTab(tab.id)}
          >
            <span className="doc-tab-label">{tab.label}</span>
            <button
              className="doc-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              aria-label={`Close ${tab.label}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="doc-content-area">
        {activeTab ? (
          renderContent(activeTab, onContentChange)
        ) : (
          <div className="doc-empty-state">
            <p className="doc-empty-subtitle">Select a tab to view its content</p>
          </div>
        )}
      </div>
    </div>
  );
}
