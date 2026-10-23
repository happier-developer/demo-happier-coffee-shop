// Logic thuần cho quản lý bài viết Blog phía admin (HAP-28) — KHÔNG
// import DB/Drizzle/Next để kiểm thử độc lập, cùng mẫu
// src/lib/products/admin-validate.ts. Validate ở Server Action là chốt
// chặn thật; client chỉ hiển thị lỗi trả về.
//
// Nội dung bài là HTML do editor Tiptap sinh ra (chỉ admin mới tạo/sửa
// qua editor), nên module này chỉ kiểm tra độ dài/độ rỗng sau khi gỡ thẻ
// và định dạng các trường phụ — KHÔNG cố làm sạch HTML (schema của
// Tiptap đã giới hạn thẻ/mark được phép khi soạn thảo).

export interface PostFormInput {
  title: string;
  excerpt?: string;
  /** HTML từ Tiptap (editor.getHTML()). */
  contentHtml: string;
  coverImageUrl?: string;
  author?: string;
  /** true = xuất bản ngay; false = lưu nháp. */
  publish: boolean;
}

export interface ValidPostData {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  author: string;
  isPublished: boolean;
}

export type PostFieldErrors = Partial<
  Record<"title" | "excerpt" | "content" | "coverImageUrl" | "author", string>
>;

export type ValidatePostResult =
  | { ok: true; data: ValidPostData }
  | { ok: false; fieldErrors: PostFieldErrors };

export const MAX_POST_TITLE_LENGTH = 180;
export const MAX_POST_EXCERPT_LENGTH = 300;
export const MAX_POST_AUTHOR_LENGTH = 80;
export const MAX_POST_CONTENT_LENGTH = 100_000;
export const MAX_POST_COVER_URL_LENGTH = 1000;
export const DEFAULT_POST_AUTHOR = "Happier Coffee";
// Độ dài excerpt tự sinh từ nội dung khi admin để trống.
const AUTO_EXCERPT_LENGTH = 160;

/** Gỡ thẻ HTML + giải mã entity cơ bản → văn bản thuần (đo độ rỗng/cắt excerpt). */
export function htmlToPlainText(html: string): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cắt excerpt từ nội dung HTML: lấy đoạn đầu, dừng ở biên từ, thêm "…". */
export function excerptFromHtml(html: string, maxLength = AUTO_EXCERPT_LENGTH): string {
  const text = htmlToPlainText(html);
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function isAcceptableImageUrl(value: string): boolean {
  // Cùng quy ước ảnh sản phẩm (HAP-16): https:// hoặc đường dẫn nội bộ /...
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validatePostInput(input: PostFormInput): ValidatePostResult {
  const fieldErrors: PostFieldErrors = {};

  const title = (input.title ?? "").trim();
  if (!title) {
    fieldErrors.title = "Vui lòng nhập tiêu đề bài viết.";
  } else if (title.length > MAX_POST_TITLE_LENGTH) {
    fieldErrors.title = `Tiêu đề tối đa ${MAX_POST_TITLE_LENGTH} ký tự.`;
  }

  const content = (input.contentHtml ?? "").trim();
  if (!content || !htmlToPlainText(content)) {
    fieldErrors.content = "Bài viết chưa có nội dung.";
  } else if (content.length > MAX_POST_CONTENT_LENGTH) {
    fieldErrors.content = "Nội dung bài viết quá dài.";
  }

  let excerpt = (input.excerpt ?? "").trim();
  if (excerpt.length > MAX_POST_EXCERPT_LENGTH) {
    fieldErrors.excerpt = `Tóm tắt tối đa ${MAX_POST_EXCERPT_LENGTH} ký tự.`;
  }
  if (!excerpt && content) {
    excerpt = excerptFromHtml(content);
  }

  const coverRaw = (input.coverImageUrl ?? "").trim();
  let coverImageUrl: string | null = null;
  if (coverRaw) {
    if (
      coverRaw.length > MAX_POST_COVER_URL_LENGTH ||
      !isAcceptableImageUrl(coverRaw)
    ) {
      fieldErrors.coverImageUrl =
        "Ảnh bìa phải là liên kết https:// hợp lệ (hoặc đường dẫn nội bộ).";
    } else {
      coverImageUrl = coverRaw;
    }
  }

  const author = (input.author ?? "").trim() || DEFAULT_POST_AUTHOR;
  if (author.length > MAX_POST_AUTHOR_LENGTH) {
    fieldErrors.author = `Tên tác giả tối đa ${MAX_POST_AUTHOR_LENGTH} ký tự.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      title,
      excerpt,
      content,
      coverImageUrl,
      author,
      isPublished: Boolean(input.publish),
    },
  };
}
