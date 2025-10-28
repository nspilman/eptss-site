'use client';

import React from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
  hideToolbar?: boolean;
  className?: string;
}

/**
 * MarkdownEditor component for creating and editing markdown content
 *
 * Features:
 * - Live preview with split view
 * - Markdown toolbar with common formatting options
 * - Outputs raw markdown for database storage
 *
 * @example
 * ```tsx
 * const [content, setContent] = useState('');
 *
 * return (
 *   <MarkdownEditor
 *     value={content}
 *     onChange={setContent}
 *     placeholder="Start writing your reflection..."
 *   />
 * );
 * ```
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  height = 400,
  preview = 'live',
  hideToolbar = false,
  className = '',
}) => {
  const handleChange = (val: string | undefined) => {
    onChange(val || '');
  };

  return (
    <div className={className} data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={handleChange}
        preview={preview}
        height={height}
        hideToolbar={hideToolbar}
        textareaProps={{
          placeholder,
        }}
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.hr,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.codeBlock,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.checkedListCommand,
        ]}
      />
    </div>
  );
};
