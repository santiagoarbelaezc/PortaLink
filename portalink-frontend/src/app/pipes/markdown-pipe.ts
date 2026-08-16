import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    let html = value.replace(/===LANDING_JSON_START===[\s\S]*?===LANDING_JSON_END===/g, '').trim();

    // Bold text (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold font-headline text-neutral-900">$1</strong>');
    
    // Italic text (*text* or _text_)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Bullet points (- or *)
    html = html.replace(/^[\s]*[-*]\s+(.*)/gm, '<li class="ml-4 list-disc mb-1">$1</li>');
    
    // Numbered lists (1. 2. 3.)
    html = html.replace(/^[\s]*\d+\.\s+(.*)/gm, '<li class="ml-4 list-decimal mb-1">$1</li>');

    // Markdown Links [Text](URL) -> Action Button Chips
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      const u = url.trim();
      const l = label.trim();

      // WhatsApp Button
      if (u.includes('wa.me') || u.includes('whatsapp')) {
        return `<a href="${u}" target="_blank" rel="noopener" style="color: #ffffff !important;" class="inline-flex items-center gap-2 px-4 py-2 my-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-headline tracking-wide transition-all shadow-sm group hover:scale-[1.02] cursor-pointer no-underline"><svg class="w-4 h-4 fill-current shrink-0" style="color: #ffffff !important;" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.002 3.66 3.745-.983z"/></svg><span style="color: #ffffff !important;">${l}</span></a>`;
      }

      // Instagram Button
      if (u.includes('instagram')) {
        return `<a href="${u}" target="_blank" rel="noopener" style="color: #ffffff !important;" class="inline-flex items-center gap-2 px-4 py-2 my-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold font-headline tracking-wide transition-all shadow-sm group hover:scale-[1.02] cursor-pointer no-underline"><svg class="w-4 h-4 fill-current shrink-0" style="color: #ffffff !important;" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg><span style="color: #ffffff !important;">${l}</span></a>`;
      }

      // LinkedIn Button
      if (u.includes('linkedin')) {
        return `<a href="${u}" target="_blank" rel="noopener" style="color: #ffffff !important;" class="inline-flex items-center gap-2 px-4 py-2 my-1.5 rounded-full bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold font-headline tracking-wide transition-all shadow-sm group hover:scale-[1.02] cursor-pointer no-underline"><svg class="w-4 h-4 fill-current shrink-0" style="color: #ffffff !important;" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg><span style="color: #ffffff !important;">${l}</span></a>`;
      }

      // TikTok Button
      if (u.includes('tiktok')) {
        return `<a href="${u}" target="_blank" rel="noopener" style="color: #ffffff !important;" class="inline-flex items-center gap-2 px-4 py-2 my-1.5 rounded-full bg-black hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold font-headline tracking-wide transition-all shadow-sm group hover:scale-[1.02] cursor-pointer no-underline"><svg class="w-4 h-4 fill-current shrink-0" style="color: #ffffff !important;" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.32 1.55-1.36 2.55-.01.55.15 1.1.44 1.56.59.88 1.68 1.41 2.74 1.34 1.07-.02 2.07-.58 2.6-1.5.33-.57.47-1.24.46-1.9-.02-3.87-.01-7.74-.01-11.61z"/></svg><span style="color: #ffffff !important;">${l}</span></a>`;
      }

      // Internal Router Link or Project Button
      const isInternal = u.startsWith('/') || u.includes('localhost') || u.includes('portalink.com');
      const target = isInternal ? '_self' : '_blank';

      return `<a href="${u}" target="${target}" style="color: #ffffff !important;" class="inline-flex items-center gap-2 px-4 py-2 my-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold font-headline tracking-wide transition-all shadow-sm group hover:scale-[1.02] cursor-pointer no-underline"><span style="color: #ffffff !important;">${l}</span><svg class="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #ffffff !important;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></a>`;
    });

    // Paragraph breaks and newlines
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    // Clean up redundant breaks around list items
    html = html.replace(/<br>\s*<li/g, '<li');
    html = html.replace(/<\/li>\s*<br>/g, '</li>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
