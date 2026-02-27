import { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Save } from 'lucide-react';
import './PromptsPanel.css';

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
];

export interface PromptValues {
  [key: string]: string;
}

interface PromptsPanelProps {
  onPromptsChange?: (prompts: PromptValues) => void;
}

export function PromptsPanel({ onPromptsChange }: PromptsPanelProps) {
  const [prompts, setPrompts] = useState<PromptValues>({});
  const [savedNotice, setSavedNotice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrompts() {
      const loaded: PromptValues = {};
      for (const section of PROMPT_SECTIONS) {
        try {
          const res = await fetch(`/prompts/${section.filename}`);
          if (res.ok) {
            loaded[section.key] = await res.text();
          } else {
            loaded[section.key] = `# ${section.label}\n\nAdd your ${section.label.toLowerCase()} here...`;
          }
        } catch {
          loaded[section.key] = `# ${section.label}\n\nAdd your ${section.label.toLowerCase()} here...`;
        }
      }
      setPrompts(loaded);
      setLoading(false);
      onPromptsChange?.(loaded);
    }
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (key: string, value: string) => {
      setPrompts((prev) => {
        const next = { ...prev, [key]: value };
        onPromptsChange?.(next);
        return next;
      });
    },
    [onPromptsChange],
  );

  const handleSave = useCallback(() => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }, []);

  if (loading) {
    return (
      <div className="prompts-panel">
        <div className="prompts-panel-header">
          <h2 className="prompts-panel-title">Prompts</h2>
        </div>
        <div className="prompts-panel-loading">Loading prompts...</div>
      </div>
    );
  }

  return (
    <div className="prompts-panel">
      <div className="prompts-panel-header">
        <h2 className="prompts-panel-title">Prompts</h2>
        <button className="prompts-save-btn" onClick={handleSave} title="Save prompts for this session">
          <Save size={14} />
          <span>{savedNotice ? 'Saved!' : 'Save'}</span>
        </button>
      </div>

      <div className="prompts-panel-body">
        <Accordion type="multiple" defaultValue={['system-prompt']}>
          {PROMPT_SECTIONS.map((section) => (
            <AccordionItem key={section.key} value={section.key}>
              <AccordionTrigger className="text-white/90 hover:text-white text-xs">
                {section.label}
              </AccordionTrigger>
              <AccordionContent>
                <textarea
                  className="prompts-textarea"
                  value={prompts[section.key] || ''}
                  onChange={(e) => handleChange(section.key, e.target.value)}
                  spellCheck={false}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
