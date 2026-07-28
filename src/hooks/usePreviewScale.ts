import { useEffect, useRef, useState } from "react";

const PAGE_WIDTH = 794;

export function usePreviewScale() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const availableWidth = container.clientWidth - 48;
      setScale(Math.min(1, Math.max(0.3, availableWidth / PAGE_WIDTH)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return { containerRef, scale };
}
