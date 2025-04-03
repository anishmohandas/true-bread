// Remove or comment out the Article interface from this file
// since we're using the one from article.interface.ts
export interface Editorial {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  publishDate: string;
  month: string;
  editor: {
    name: string;
    role: string;
    imageUrl: string;
    bio: string;
  };
  imageUrl?: string;
  year: string;
  language: 'en' | 'ml';
  
  // Malayalam translations
  titleMl?: string;
  contentMl?: string;
  excerptMl?: string;
  monthMl?: string;
}




