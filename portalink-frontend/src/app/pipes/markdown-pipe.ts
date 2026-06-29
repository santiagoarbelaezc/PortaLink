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

    let html = value;

    // Bold text (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--text-primary)]">$1</strong>');
    
    // Italic text (*text* or _text_)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Bullet points (- or *)
    html = html.replace(/^[\s]*[-*]\s+(.*)/gm, '<li class="ml-4 list-disc mb-1">$1</li>');
    
    // Numbered lists (1. 2. 3.)
    html = html.replace(/^[\s]*\d+\.\s+(.*)/gm, '<li class="ml-4 list-decimal mb-1">$1</li>');

    // Paragraph breaks and newlines
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    // Clean up redundant breaks around list items
    html = html.replace(/<br>\s*<li/g, '<li');
    html = html.replace(/<\/li>\s*<br>/g, '</li>');

    // Wrap groups of <li> in <ul> or <ol> is hard with simple regex, 
    // but Tailwind base styles allow <li> to render decently without a parent wrapper 
    // if margin and list-style classes are applied directly to the <li>.

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
