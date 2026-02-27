import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, FileJson, File } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import './DataFilesPanel.css';

export interface DataFile {
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

interface DataFilesPanelProps {
  onFilesChange?: (files: DataFile[]) => void;
}

export function DataFilesPanel({ onFilesChange }: DataFilesPanelProps) {
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
          onFilesChange?.(manifest);
        }
      } catch {
        // Manifest not available
      }
      setLoading(false);
    }
    loadManifest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = useCallback(async (file: DataFile) => {
    if (file.isUploaded && file.content) {
      const blob = new Blob([file.content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = `/data-and-files/${file.name}`;
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
          const exists = prev.findIndex((f) => f.name === file.name);
          const newFile: DataFile = {
            name: file.name,
            description: 'Uploaded file',
            isUploaded: true,
            content,
          };
          const next = exists >= 0
            ? prev.map((f, i) => (i === exists ? newFile : f))
            : [...prev, newFile];
          onFilesChange?.(next);
          return next;
        });
      };
      reader.readAsText(file);
    });

    e.target.value = '';
  }, [onFilesChange]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Data & Files</CardTitle>
        <Button variant="outline" size="sm" onClick={handleUpload}>
          <Upload size={14} />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelected}
          style={{ display: 'none' }}
          accept=".csv,.json,.md,.txt,.xlsx,.pdf"
        />
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No files available. Upload files to get started.
          </p>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(file)}
                  title={`Download ${file.name}`}
                >
                  <Download size={13} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
