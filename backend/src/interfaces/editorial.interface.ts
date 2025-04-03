export interface Editorial {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    publishDate: Date;
    editorId: number;
    imageUrl: string;
    month: string;
    year: number;
    language: 'en' | 'ml';
    
    // Malayalam fields
    titleMl?: string | null;
    contentMl?: string | null;
    excerptMl?: string | null;
    monthMl?: string | null;
    
    // Editor information
    editor?: Editor;
}

export interface Editor {
    id: number;
    name: string;
    role: string;
    imageUrl: string;
    bio: string;
    
    // Malayalam fields
    nameMl?: string | null;
    roleMl?: string | null;
    bioMl?: string | null;
}

