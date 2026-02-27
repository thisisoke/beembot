import { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

  if (loading) {
    return (
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">Loading prompts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Prompts</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['system-prompt']}>
          {PROMPT_SECTIONS.map((section) => (
            <AccordionItem key={section.key} value={section.key}>
              <AccordionTrigger className="text-xs">
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
      </CardContent>
    </Card>
  );
}
