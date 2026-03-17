import { useRef, useCallback } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { DataFile } from '../DataFilesPanel/DataFilesPanel';
import type { PromptValues } from '../PromptsPanel/PromptsPanel';
import './NavigationPanel.css';

interface PromptSection {
  key: string;
  label: string;
  filename: string;
}

const PROMPT_SECTIONS: PromptSection[] = [
  { key: 'system-prompt', label: 'System Prompt', filename: 'system-prompt.md' },
  { key: 'guardrails-specs', label: 'Guardrails Specs', filename: 'guardrails-specs.md' },
  {
    key: 'topical-conversation-guidelines',
    label: 'Topical Conversation Guidelines',
    filename: 'topical-conversation-guidelines.md',
  },
  { key: 'edge-cases', label: 'Edge Case Library', filename: 'edge-cases.md' },
];

function getFileIcon(name: string, size = 14) {
  if (name.endsWith('.csv')) return <FileSpreadsheet size={size} />;
  if (name.endsWith('.json')) return <FileJson size={size} />;
  if (name.endsWith('.md')) return <FileText size={size} />;
  return <File size={size} />;
}

interface NavigationPanelProps {
  // Connection
  isConnected: boolean | null;
  ollamaModel: string;
  ollamaUrl: string;
  onModelChange: (model: string) => void;
  onUrlChange: (url: string) => void;

  // Prompts
  prompts: PromptValues;
  promptsLoading: boolean;
  onOpenPrompt: (key: string) => void;

  // Sources / Data files
  dataFiles: DataFile[];
  filesLoading: boolean;
  onOpenSource: (file: DataFile) => void;
  onUploadFiles: (files: FileList) => void;
  onDownloadFile: (file: DataFile) => void;
  onSaveAll: () => void;

  // Active document tracking
  activeDocId: string | null;

  // Section collapse
  promptsExpanded: boolean;
  sourcesExpanded: boolean;
  onTogglePrompts: () => void;
  onToggleSources: () => void;
}

export function NavigationPanel({
  isConnected,
  ollamaModel,
  ollamaUrl,
  onModelChange,
  onUrlChange,
  prompts,
  promptsLoading,
  onOpenPrompt,
  dataFiles,
  filesLoading,
  onOpenSource,
  onUploadFiles,
  onDownloadFile,
  onSaveAll,
  activeDocId,
  promptsExpanded,
  sourcesExpanded,
  onTogglePrompts,
  onToggleSources,
}: NavigationPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUploadFiles(e.target.files);
      }
      e.target.value = '';
    },
    [onUploadFiles],
  );

  return (
    <aside className="nav-panel">
      {/* ── Connection Status ── */}
      <div className="nav-connection">
        <div className="nav-connection-status">
          <div
            className={`nav-status-dot ${
              isConnected === null
                ? 'nav-status-dot--checking'
                : isConnected
                  ? 'nav-status-dot--connected'
                  : 'nav-status-dot--error'
            }`}
          />
          <span className="nav-status-label">
            {isConnected === null
              ? 'Checking...'
              : isConnected
                ? 'Connected'
                : 'Not reachable'}
          </span>
        </div>
        <div className="nav-connection-fields">
          <div className="nav-field">
            <label className="nav-field-label">Model</label>
            <input
              type="text"
              value={ollamaModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="nav-field-input"
              placeholder="llama3.1:8b"
            />
          </div>
          <div className="nav-field">
            <label className="nav-field-label">Server</label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              className="nav-field-input"
              placeholder="http://localhost:11434"
            />
          </div>
        </div>
      </div>

      {/* ── Navigation sections ── */}
      <div className="nav-sections">
        {/* ── Prompts section ── */}
        <div className="nav-section">
          <button className="nav-section-header" onClick={onTogglePrompts}>
            {promptsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="nav-section-title">Prompts</span>
            <span className="nav-section-count">{Object.keys(prompts).length}</span>
          </button>

          {promptsExpanded && (
            <div className="nav-section-content">
              {promptsLoading ? (
                <div className="nav-loading">Loading prompts...</div>
              ) : (
                <ul className="nav-file-list">
                  {PROMPT_SECTIONS.map((section) => (
                    <li
                      key={section.key}
                      className={`nav-file-item ${activeDocId === `prompt-${section.key}` ? 'nav-file-item--active' : ''}`}
                      onClick={() => onOpenPrompt(section.key)}
                    >
                      <FileText size={14} className="nav-file-icon" />
                      <span className="nav-file-name">{section.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ── Sources section ── */}
        <div className="nav-section">
          <button className="nav-section-header" onClick={onToggleSources}>
            {sourcesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="nav-section-title">Sources</span>
            <span className="nav-section-count">{dataFiles.length}</span>
          </button>

          {sourcesExpanded && (
            <div className="nav-section-content">
              <div className="nav-section-actions">
                <button className="nav-action-btn" onClick={handleUploadClick} title="Upload files">
                  <Upload size={12} />
                  <span>Upload</span>
                </button>
                <button className="nav-action-btn" onClick={onSaveAll} title="Download all as ZIP">
                  <Download size={12} />
                  <span>Save All</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelected}
                style={{ display: 'none' }}
                accept=".csv,.json,.md,.txt,.xlsx,.pdf"
              />

              {filesLoading ? (
                <div className="nav-loading">Loading files...</div>
              ) : dataFiles.length === 0 ? (
                <div className="nav-loading">No files. Upload to get started.</div>
              ) : (
                <ul className="nav-file-list">
                  {dataFiles.map((file) => (
                    <li
                      key={file.name}
                      className={`nav-file-item ${activeDocId === `source-${file.name}` ? 'nav-file-item--active' : ''}`}
                    >
                      <div
                        className="nav-file-item-main"
                        onClick={() => onOpenSource(file)}
                      >
                        <span className="nav-file-icon">{getFileIcon(file.name)}</span>
                        <span className="nav-file-name">{file.name}</span>
                      </div>
                      <button
                        className="nav-file-download"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadFile(file);
                        }}
                        title={`Download ${file.name}`}
                      >
                        <Download size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
