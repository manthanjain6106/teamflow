'use client';

import { useEffect, useMemo } from 'react';

export default function Outline({ html, onJump }: { html: string; onJump?: (id: string) => void }) {
  const items = useMemo(() => {
    if (!html) return [] as { id: string; text: string; level: number }[];
    const container = document.createElement('div');
    container.innerHTML = html;
    const headers = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')) as HTMLElement[];
    return headers.map((el, index) => {
      const id = el.id || `h-${index}`;
      el.id = id;
      return { id, text: el.textContent || `Heading ${index + 1}`, level: Number(el.tagName[1]) };
    });
  }, [html]);

  useEffect(() => {
    // ensure headings have IDs in the live DOM
    const headers = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    headers.forEach((el, i) => {
      if (!(el as HTMLElement).id) (el as HTMLElement).id = `h-${i}`;
    });
  }, [html]);

  return (
    <div className="space-y-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => {
            const node = document.getElementById(it.id);
            if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            onJump?.(it.id);
          }}
          className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${it.level > 1 ? 'pl-4' : ''}`}
        >
          {it.text}
        </button>
      ))}
      {items.length === 0 && <div className="text-xs text-gray-500">No headings.</div>}
    </div>
  );
}


