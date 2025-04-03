export interface Editorial {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  publishDate: string;
  month: string;
  year: string;
  editor: {
    name: string;
    role: string;
    imageUrl: string;
    bio: string;
  };
  imageUrl?: string;
  language: 'en' | 'ml';
  
  // Malayalam translations
  titleMl?: string;
  contentMl?: string;
  excerptMl?: string;
  monthMl?: string;
}


