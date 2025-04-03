export interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  altText: string;
  publishDate: string;
  readTime: number;
  category: string;
  jobTitle?: string;
  worksAt?: string;
  language: 'en' | 'ml';
  tags: Array<{en: string, ml: string}>;
  images?: Array<{
    url: string;
    alt: string;
    altMl?: string;
    caption: string;
    captionMl?: string;
  }>;
  
  // Malayalam translations with camelCase
  titleMl?: string;
  authorMl?: string;
  contentMl?: string;
  excerptMl?: string;
  altTextMl?: string;
  categoryMl?: string;
  jobTitleMl?: string;
  worksAtMl?: string;
}





