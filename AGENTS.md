# AGENTS.md — Happier Coffee (KH-001)

Ghi chú cho coding agent làm việc trong repo này:

- Stack đã ghim tại cổng G3 (không tự nâng phiên bản): Next.js 16.4.2, React 19.3.1, Tailwind CSS 4.3.3, Drizzle ORM 0.45.4, @neondatabase/serverless 1.2.0, @neondatabase/auth 0.7.0-beta. Xem `ARCHITECTURE.md` để biết quyết định kiến trúc, `DESIGN.md` để biết token giao diện.
- Nguồn sự thật về công việc là Linear (project P-HAP-1) — không dùng GitHub Issues.
- Skills hỗ trợ agent nằm ở `.agents/skills/` (bản gốc), `.claude/skills/` (cho Claude Code) và `agent/skills/`; danh sách + nguồn gốc ở `skills-lock.json`. Cài lại bằng `npx skills add vercel/next.js --skill <tên>` và `npx neon@latest skills -s neon -s neon-postgres -y`.
- Dữ liệu đơn hàng/tài khoản/admin/auth tuyệt đối không được cache; chỉ catalogue sản phẩm (products/categories) mới dùng cache có tag `catalog` kèm `updateTag`/`revalidatePath` trong Server Actions admin (HAP-21).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
