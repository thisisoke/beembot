import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, FileJson, File } from 'lucide-react';
import './DataFilesPanel.css';

interface DataFile {
  name: string;
  description: string;
  isUploaded?: boolean;
  content?: string;
}

function getFileIcon(name: string) {
  if (name.endsWith('.csv')) return <FileSpreadsheet size={14} />;
  if (name.endsWith('.json')) return <FileJson size={14} />;
  if (name.endsWith('.md')) return <FileText size={14} />;
  return <File size={14} />;
}

export function DataFilesPanel() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadManifest() {
      try {
        const res = await fetch('/data-and-files/manifest.json');
        if (res.ok) {
          const manifest: DataFile[] = await res.json();
          setFiles(manifest);
        }
      } catch {
        // Manifest not available
      }
      setLoading(false);
    }
    loadManifest();
  }, []);

  const handleDownload = useCallback(async (file: DataFile) => {
    if (file.isUploaded && file.content) {
      // Download uploaded file from memory
      const blob = new Blob([file.content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Download from public folder
      const url = `/data-and-files/${file.name}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
    }
  }, []);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setFiles((prev) => {
          // Replace if same name exists, otherwise append
          const exists = prev.findIndex((f) => f.name === file.name);
          const newFile: DataFile = {
            name: file.name,
            description: 'Uploaded file',
            isUploaded: true,
            content,
          };
          if (exists >= 0) {
            const next = [...prev];
            next[exists] = newFile;
            return next;
          }
          return [...prev, newFile];
        });
      };
      reader.readAsText(file);
    });

    // Reset input so the same file can be re-uploaded
    e.target.value = '';
  }, []);

  return (
    <div className="data-files-panel">
      <div className="data-files-header">
        <h2 className="data-files-title">Data &amp; Files</h2>
        <button className="data-files-upload-btn" onClick={handleUpload} title="Upload a file">
          <Upload size={14} />
          <span>Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelected}
          style={{ display: 'none' }}
          accept=".csv,.json,.md,.txt,.xlsx,.pdf"
        />
      </div>

      <div className="data-files-body">
        {loading ? (
          <div className="data-files-loading">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="data-files-empty">No files available. Upload files to get started.</div>
        ) : (
          <ul className="data-files-list">
            {files.map((file) => (
              <li key={file.name} className="data-file-item">
                <div className="data-file-info">
                  <span className="data-file-icon">{getFileIcon(file.name)}</span>
                  <div className="data-file-meta">
                    <span className="data-file-name">{file.name}</span>
                    <span className="data-file-desc">{file.description}</span>
                  </div>
                </div>
                <button
                  className="data-file-download-btn"
                  onClick={() => handleDownload(file)}
                  title={`Download ${file.name}`}
                >
                  <Download size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
