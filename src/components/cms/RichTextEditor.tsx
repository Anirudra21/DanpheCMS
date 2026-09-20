'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/cms-utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className={cn(
      'h-8 w-8 p-0 text-muted-foreground hover:text-danphe-primary',
      isActive && 'bg-danphe-accent/10 text-danphe-accent'
    )}
    onClick={onClick}
    title={title}
  >
    {children}
  </Button>
);

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] px-4 py-3 outline-none prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-md border border-danphe-border min-h-[300px] animate-pulse bg-muted/30" />
    );
  }

  return (
    <div className="rounded-md border border-danphe-border overflow-hidden focus-within:ring-2 focus-within:ring-danphe-accent/30 focus-within:border-danphe-accent/50 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-danphe-border bg-danphe-bg-light px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* TipTap placeholder styling */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          min-height: 300px;
        }
        .tiptap h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
        }
        .tiptap h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.75em 0;
        }
        .tiptap h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.83em 0;
        }
        .tiptap blockquote {
          border-left: 3px solid #0d9488;
          padding-left: 1rem;
          color: #475569;
          font-style: italic;
        }
        .tiptap code {
          background: #f1f5f9;
          padding: 0.15em 0.3em;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .tiptap pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .tiptap pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .tiptap hr {
          border-color: #e2e8f0;
          margin: 1.5rem 0;
        }
        .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
