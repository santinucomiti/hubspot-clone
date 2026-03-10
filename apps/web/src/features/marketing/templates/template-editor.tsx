'use client';

import { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariableInserter } from './variable-inserter';

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateEditor({ value, onChange }: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInsertVariable(variable: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + variable);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue =
      value.substring(0, start) + variable + value.substring(end);
    onChange(newValue);

    // Restore cursor position after the inserted variable
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + variable.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <VariableInserter onInsert={handleInsertVariable} />
        <span className="text-xs text-muted-foreground">
          Use variables like {'{{contact.firstName}}'} to personalize emails.
        </span>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList>
          <TabsTrigger value="code">HTML Editor</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="split">Split View</TabsTrigger>
        </TabsList>

        <TabsContent value="code">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[400px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            placeholder={'<html>\n  <body>\n    <h1>Hello {{contact.firstName}}!</h1>\n    <p>Your email content here...</p>\n  </body>\n</html>'}
            spellCheck={false}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="min-h-[400px] rounded-md border bg-white p-4">
            <iframe
              srcDoc={value || '<p style="color:#999">Preview will appear here...</p>'}
              className="w-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
              title="Email preview"
            />
          </div>
        </TabsContent>

        <TabsContent value="split">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                HTML Source
              </p>
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full min-h-[400px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                spellCheck={false}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Preview
              </p>
              <div className="min-h-[400px] rounded-md border bg-white p-4">
                <iframe
                  srcDoc={value || '<p style="color:#999">Preview will appear here...</p>'}
                  className="w-full min-h-[400px] border-0"
                  sandbox="allow-same-origin"
                  title="Email preview"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
