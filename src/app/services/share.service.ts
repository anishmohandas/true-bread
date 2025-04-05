import { Injectable } from '@angular/core';
import { Article } from '../shared/interfaces/article.interface';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() { }

  /**
   * Share an article via WhatsApp
   * @param article The article to share
   * @param url The URL of the article
   */
  shareViaWhatsApp(article: Article, url: string): void {
    const text = `Check out this article: ${article.title} - ${url}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Share an article via Facebook
   * @param url The URL of the article
   */
  shareViaFacebook(url: string): void {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    // Open Facebook share dialog in a new window
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }

  /**
   * Share an article via X (Twitter)
   * @param article The article to share
   * @param url The URL of the article
   */
  shareViaX(article: Article, url: string): void {
    const text = `Check out "${article.title}"`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    // Open X (Twitter) share dialog in a new window
    window.open(xUrl, '_blank', 'width=600,height=300');
  }

  /**
   * Share an article via Instagram (opens story creation)
   * Note: Instagram doesn't have a direct web sharing API like the others.
   * This will open Instagram app if on mobile, but functionality is limited.
   */
  shareViaInstagram(): void {
    // Instagram doesn't have a direct web sharing API like the others
    // We can only open the Instagram app or website
    alert('To share on Instagram, please screenshot this article and share it to your Instagram story or feed.');

    // Optionally open Instagram
    window.open('https://www.instagram.com/', '_blank');
  }

  /**
   * Share the current page via WhatsApp
   */
  shareCurrentPageViaWhatsApp(): void {
    const currentUrl = window.location.href;
    const title = document.title;
    const text = `Check out this page: ${title} - ${currentUrl}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  }
}
