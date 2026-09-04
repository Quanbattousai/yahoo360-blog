"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
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
  Code2,
  LinkIcon,
  ImageIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import type { Json } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { getEditorExtensions } from "@/lib/editor/extensions";

interface Props {
  content: Json;
  onChange: (json: Json) => void;
  userId: string;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
        active ? "bg-[#e91e63] text-white" : "text-black/70 hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ content, onChange, userId, placeholder }: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: getEditorExtensions({ placeholder }),
    content: content as object,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "post-content min-h-[320px] rounded-b-xl border border-t-0 border-black/10 bg-white px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Json),
  });

  const setLink = useCallback(
    (ed: Editor) => {
      const prev = ed.getAttributes("link").href as string | undefined;
      const url = window.prompt("Link URL", prev ?? "https://");
      if (url === null) return;
      if (url === "") {
        ed.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      ed.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
    []
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;

      setUploading(true);
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setUploading(false);
        window.alert(`Image upload failed: ${error.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(path);

      editor.chain().focus().setImage({ src: publicUrl }).run();
      setUploading(false);
    },
    [editor, supabase, userId]
  );

  if (!editor) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-black/10 bg-white text-black/40">
        Loading editor…
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-black/10 bg-black/[0.02] p-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough size={16} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 size={16} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
          <Code2 size={16} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton onClick={() => setLink(editor)} active={editor.isActive("link")} title="Link">
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => fileRef.current?.click()} disabled={uploading} title="Insert image">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 size={16} />
        </ToolbarButton>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <EditorContent editor={editor} />
    </div>
  );
}
