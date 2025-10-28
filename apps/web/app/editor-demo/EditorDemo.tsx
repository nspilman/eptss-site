'use client';

import { useState } from 'react';
import { MarkdownEditor } from '@eptss/rich-text-editor';

export const EditorDemo = () => {
  const [content, setContent] = useState(`# Welcome to the Markdown Editor

This is a demonstration of the rich text editor for EPTSS reflections.

## Features

- **Bold** and *italic* text
- Links and [references](https://example.com)
- Code blocks and \`inline code\`
- Lists and checkboxes

## Try it out!

Start editing this text or clear it and write your own reflection...

### Code Example

\`\`\`javascript
const greeting = "Hello, EPTSS!";
console.log(greeting);
\`\`\`

> Blockquotes for important notes

- [ ] Todo items
- [x] Completed items
`);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">
          Markdown Editor Demo
        </h1>
        <p className="text-[var(--color-gray-300)]">
          Test the rich text editor for reflections and blog posts
        </p>
      </div>

      <div className="mb-8">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your reflection..."
          height={600}
        />
      </div>

      <div className="mt-8 p-4 bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-gray-800)]">
        <h2 className="text-xl font-bold text-[var(--color-primary)] mb-2">
          Raw Markdown Output
        </h2>
        <p className="text-sm text-[var(--color-gray-400)] mb-4">
          This is what gets stored in the database:
        </p>
        <pre className="text-xs text-[var(--color-gray-300)] bg-[var(--color-gray-900-40)] p-4 rounded overflow-x-auto">
          {content}
        </pre>
      </div>
    </div>
  );
};
