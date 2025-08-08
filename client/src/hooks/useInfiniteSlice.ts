import { useEffect, useMemo, useRef, useState } from "react";

export function useInfiniteSlice<T>(source: T[], pageSize: number = 20) {
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState<T[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMore = useMemo(() => page * pageSize < source.length, [page, pageSize, source.length]);

  useEffect(() => {
    setPage(1);
  }, [source.length]);

  useEffect(() => {
    setVisible(source.slice(0, page * pageSize));
  }, [page, pageSize, source]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1);
        }
      });
    }, { rootMargin: '200px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef.current]);

  return { visible, hasMore, sentinelRef, reset: () => setPage(1) } as const;
}

