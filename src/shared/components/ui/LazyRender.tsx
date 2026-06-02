import { useState, useEffect, useRef, ReactNode, CSSProperties } from 'react';

export interface LazyRenderProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  rootMargin?: string;
}

export const LazyRender = ({ children, className, style, rootMargin = '300px' }: LazyRenderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={style}>
      {visible
        ? children
        : <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-200 animate-pulse" />
      }
    </div>
  );
};
