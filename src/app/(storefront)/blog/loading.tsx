import Container from "@/components/ui/Container";

// Skeleton trang danh sách Blog khi đang tải (mẫu HAP-21/HAP-26):
// khung thẻ bài giữ nguyên bố cục lưới để màn hình không nhảy.

export default function BlogListLoading() {
  return (
    <Container className="py-10 md:py-14" aria-busy="true">
      <div className="mb-8 max-w-2xl animate-pulse">
        <div className="h-9 w-64 rounded-lg bg-line/60" />
        <div className="mt-3 h-5 w-full max-w-md rounded-lg bg-line/50" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="aspect-[16/9] w-full bg-line/50" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-32 rounded bg-line/60" />
              <div className="h-5 w-full rounded bg-line/60" />
              <div className="h-4 w-5/6 rounded bg-line/50" />
              <div className="h-4 w-2/3 rounded bg-line/50" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
