export interface ArticleImage {
    id?: number;
    url: string;
    alt: string;
    caption?: string;
    altMl?: string;
    captionMl?: string;
}

export interface ArticleTag {
    id?: number;
    tag: string;
    tagMl?: string;
}

export interface Article {
    id: string;
    title: string;
    author: string;
    jobTitle?: string;
    worksAt?: string;
    category: string;
    imageUrl: string;
    altText: string;
    content: string;
    excerpt: string;
    publishDate: Date;
    readTime: number;
    isFeatured: boolean;
    language: 'en' | 'ml';
    
    // Malayalam fields
    titleMl?: string;
    authorMl?: string;
    jobTitleMl?: string;
    worksAtMl?: string;
    categoryMl?: string;
    altTextMl?: string;
    contentMl?: string;
    excerptMl?: string;
    
    // Related entities
    images?: ArticleImage[];
    tags?: ArticleTag[];
}
