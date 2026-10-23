"use client";

// Editor soạn bài Blog bằng Tiptap (HAP-28) — CHỈ chạy phía client
// (trang admin nạp component này qua next/dynamic ssr:false vì Tiptap
// không render được phía server). Đầu ra là HTML (editor.getHTML())
// lưu vào blog_posts.content và render ở storefront với cùng class
// .post-content nên bản xem trong editor sát với bản khách thấy.
//
// Bộ công cụ = StarterKit 3.32.0 (đã gồm Link + Underline — kiểm chứng
// trong package.json của starter-kit, không cài trùng extension) +
// @tiptap/extension-image 3.32.0 cho chèn ảnh bằng URL. Phiên bản ghim
// chính xác trong package.json theo quy ước repo.

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import {
  Bold,
  Eraser,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Type,
  Underline,
  Undo2,
} from "lucide-react";

interface BlogEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
}

const toolButtonClasses =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-coffee transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:pointer-events-none disabled:opacity-40";
const toolButtonActiveClasses = "border-line bg-cream text-cta";

export default function BlogEditor({
  initialContent,
  onChange,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
      ImageExtension,
    ],
    content: initialContent || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "post-content min-h-[320px] px-4 py-3 focus:outline-none",
        "aria-label": "Nội dung bài viết",
      },
    },
  });

  // Đọc trạng thái active của toolbar theo selection hiện tại (Tiptap v3).
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      h2: current?.isActive("heading", { level: 2 }) ?? false,
      h3: current?.isActive("heading", { level: 3 }) ?? false,
      bullet: current?.isActive("bulletList") ?? false,
      ordered: current?.isActive("orderedList") ?? false,
      quote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  });

  if (!editor) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-line bg-surface text-sm text-muted">
        Đang tải trình soạn thảo…
      </div>
    );
  }

  function handleLink() {
    if (!editor) return;
    if (state?.link) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Dán liên kết (https://…):", "https://");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  function handleImage() {
    if (!editor) return;
    const url = window.prompt("Dán URL ảnh (https://…):", "https://");
    if (!url) return;
    const alt = window.prompt("Chữ thay thế cho ảnh (alt):", "") ?? "";
    editor.chain().focus().setImage({ src: url, alt }).run();
  }

  const tools: Array<{
    label: string;
    icon: typeof Bold;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
  }> = [
    {
      label: "Đoạn văn",
      icon: Type,
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "Tiêu đề H2",
      icon: Heading2,
      active: state?.h2,
      onClick: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Tiêu đề H3",
      icon: Heading3,
      active: state?.h3,
      onClick: () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "In đậm",
      icon: Bold,
      active: state?.bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "In nghiêng",
      icon: Italic,
      active: state?.italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Gạch chân",
      icon: Underline,
      active: state?.underline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Danh sách chấm",
      icon: List,
      active: state?.bullet,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Danh sách số",
      icon: ListOrdered,
      active: state?.ordered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Trích dẫn",
      icon: Quote,
      active: state?.quote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: state?.link ? "Bỏ liên kết" : "Chèn liên kết",
      icon: Link2,
      active: state?.link,
      onClick: handleLink,
    },
    { label: "Chèn ảnh bằng URL", icon: ImagePlus, onClick: handleImage },
    {
      label: "Xoá định dạng",
      icon: Eraser,
      onClick: () =>
        editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
    {
      label: "Hoàn tác",
      icon: Undo2,
      disabled: !state?.canUndo,
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Làm lại",
      icon: Redo2,
      disabled: !state?.canRedo,
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface transition focus-within:border-caramel focus-within:ring-2 focus-within:ring-caramel/30">
      <div
        role="toolbar"
        aria-label="Công cụ soạn thảo"
        className="flex flex-wrap items-center gap-1 border-b border-line bg-cream/60 px-2 py-1.5"
      >
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={tool.active ? true : undefined}
              disabled={tool.disabled}
              onClick={tool.onClick}
              className={`${toolButtonClasses} ${tool.active ? toolButtonActiveClasses : ""}`}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden />
            </button>
          );
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
