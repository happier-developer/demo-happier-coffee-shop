"use client";

// Form tạo/sửa bài viết Blog phía admin (HAP-28). Gọi Server Actions
// trong src/server-actions/admin-posts.ts — validate thật nằm ở server,
// form chỉ hiển thị lỗi theo trường. Editor Tiptap nạp động (ssr:false)
// vì chỉ chạy được phía client. Thành công → quay về /admin/bai-viet.

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import type { BlogPost } from "@/lib/db/schema";
import type { PostFieldErrors } from "@/lib/blog/validate";
import {
  createPostAction,
  updatePostAction,
} from "@/server-actions/admin-posts";

const BlogEditor = dynamic(() => import("@/components/admin/BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-line bg-surface text-sm text-muted">
      Đang tải trình soạn thảo…
    </div>
  ),
});

const selectClasses =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-coffee transition focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/30 disabled:opacity-50 aria-[invalid=true]:border-error";

interface PostFormProps {
  /** Có = chế độ sửa (slug giữ nguyên); không = tạo mới. */
  post?: BlogPost;
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    post?.coverImageUrl ?? "",
  );
  const [author, setAuthor] = useState(post?.author ?? "Happier Coffee");
  const [status, setStatus] = useState<"draft" | "published">(
    post?.isPublished ? "published" : "draft",
  );
  const [fieldErrors, setFieldErrors] = useState<PostFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    const input = {
      title,
      excerpt,
      contentHtml,
      coverImageUrl,
      author,
      publish: status === "published",
    };
    const result = isEdit
      ? await updatePostAction(post!.id, input)
      : await createPostAction(input);
    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setSubmitting(false);
      return;
    }
    router.push("/admin/bai-viet");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Tiêu đề bài viết" htmlFor="post-title" error={fieldErrors.title}>
        <Input
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Pha cà phê phin chuẩn vị tại nhà"
          aria-invalid={Boolean(fieldErrors.title)}
        />
      </Field>

      {isEdit ? (
        <p className="text-sm text-muted">
          Đường dẫn bài viết:{" "}
          <span className="font-medium text-coffee">/blog/{post!.slug}</span>{" "}
          — slug giữ nguyên khi sửa để không gãy liên kết đã chia sẻ.
        </p>
      ) : (
        <p className="text-sm text-muted">
          Đường dẫn (slug) sẽ tự sinh từ tiêu đề khi lưu.
        </p>
      )}

      <div>
        <Field label="Tóm tắt (excerpt)" htmlFor="post-excerpt" error={fieldErrors.excerpt}>
          <Textarea
            id="post-excerpt"
            value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
            placeholder="Một hai câu ngắn gọn về bài viết…"
            aria-invalid={Boolean(fieldErrors.excerpt)}
          />
        </Field>
        <p className="mt-1.5 text-sm text-muted">
          Hiện ở danh sách Blog và thẻ chia sẻ. Để trống sẽ tự cắt từ nội dung.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Ảnh bìa (URL https)" htmlFor="post-cover" error={fieldErrors.coverImageUrl}>
          <Input
            id="post-cover"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/…"
            inputMode="url"
            aria-invalid={Boolean(fieldErrors.coverImageUrl)}
          />
        </Field>
        <Field label="Tác giả" htmlFor="post-author" error={fieldErrors.author}>
          <Input
            id="post-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            aria-invalid={Boolean(fieldErrors.author)}
          />
        </Field>
      </div>

      {coverImageUrl.trim() ? (
        <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl bg-line/40">
          <Image
            src={coverImageUrl.trim()}
            alt="Xem trước ảnh bìa"
            fill
            sizes="448px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}

      <Field label="Nội dung bài viết" htmlFor="post-content" error={fieldErrors.content}>
        <div id="post-content">
          <BlogEditor initialContent={contentHtml} onChange={setContentHtml} />
        </div>
      </Field>

      <Field label="Trạng thái" htmlFor="post-status">
        <select
          id="post-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          className={selectClasses}
        >
          <option value="draft">Nháp — chưa hiển thị ngoài cửa hàng</option>
          <option value="published">Xuất bản — hiển thị ngay trên Blog</option>
        </select>
      </Field>

      {formError ? (
        <p role="alert" className="text-sm font-medium text-error">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Đang lưu…"
            : isEdit
              ? "Lưu thay đổi"
              : status === "published"
                ? "Xuất bản bài viết"
                : "Lưu bài nháp"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={submitting}
          onClick={() => router.push("/admin/bai-viet")}
        >
          Huỷ
        </Button>
      </div>
    </form>
  );
}
