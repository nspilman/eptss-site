# @eptss/rich-text-editor

Rich text markdown editor for EPTSS reflections and blog content.

## Features

- Markdown editing with live preview
- Outputs raw markdown for database storage
- Integrates with existing ReactMarkdown rendering
- Built on @uiw/react-md-editor

## Usage

```tsx
import { MarkdownEditor } from '@eptss/rich-text-editor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
    />
  );
}
```
