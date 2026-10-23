"use client";

// Thao tác theo từng dòng trong bảng bài viết admin (HAP-28): xuất
// bản/rút nháp nhanh và XOÁ CÓ XÁC NHẬN 2 bước — cùng mẫu
// ProductRowActions (HAP-16) + trạng thái "Đang xử lý…" (HAP-26).
// Bài viết không bị ràng buộc dữ liệu khác nên xoá hẳn được; chốt
// chặn thật vẫn nằm ở Server Action (requireAdmin).

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  deletePostAction,
  setPostPublishedAction,
} from "@/server-actions/admin-posts";

interface PostRowActionsProps {
  postId: string;
  postTitle: string;
  isPublished: boolean;
}

const smallButtonClasses =
  "inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium transition duration-state ease-standard active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:pointer-events-none disabled:opacity-50";

export default function PostRowActions({
  postId,
  postTitle,
  isPublished,
}: PostRowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);

  function showMessage(text: string, isError: boolean) {
    setMessage(text);
    setMessageIsError(isError);
  }

  async function handleTogglePublish() {
    setBusy(true);
    setMessage(null);
    const result = await setPostPublishedAction(postId, !isPublished);
    setBusy(false);
    if (!result.ok) {
      showMessage(result.message, true);
      return;
    }
    showMessage(result.message ?? "Đã cập nhật trạng thái.", false);
    router.refresh();
  }

  async function handleDelete() {
    setBusy(true);
    setMessage(null);
    const result = await deletePostAction(postId);
    setBusy(false);
    setConfirmingDelete(false);
    if (!result.ok) {
      showMessage(result.message, true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={busy}
          aria-label={
            isPublished
              ? `Rút bài "${postTitle}" về nháp`
              : `Xuất bản bài "${postTitle}"`
          }
          className={`${smallButtonClasses} border border-line bg-surface text-coffee hover:bg-cream`}
        >
          {busy ? (
            <span className="inline-flex items-center gap-1.5" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Đang xử lý…
            </span>
          ) : isPublished ? (
            "Rút về nháp"
          ) : (
            "Xuất bản"
          )}
        </button>

        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className={`${smallButtonClasses} bg-error text-white hover:opacity-90`}
            >
              {busy ? "Đang xoá…" : "Xác nhận xoá"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={busy}
              className={`${smallButtonClasses} border border-line bg-surface text-coffee hover:bg-cream`}
            >
              Huỷ
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={busy}
            aria-label={`Xoá bài "${postTitle}"`}
            className={`${smallButtonClasses} border border-error/40 bg-surface text-error hover:bg-error/10`}
          >
            Xoá
          </button>
        )}
      </div>
      {message ? (
        <p
          role={messageIsError ? "alert" : "status"}
          className={`text-xs ${messageIsError ? "text-error" : "text-success"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
