import { useEffect } from 'react';

/**
 * Bloqueia a rolagem da janela (html + body). Só `overflow` no body costuma deixar
 * o elemento `html` rolável em alguns navegadores, gerando duas barras verticais
 * quando o painel do modal também rola (ex.: max-h + overflow-y-auto).
 */
export function useScrollLock(locked: boolean, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    if (locked) {
      html.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      html.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [locked, enabled]);
}
