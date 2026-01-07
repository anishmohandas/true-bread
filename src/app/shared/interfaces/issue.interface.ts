export interface Issue {
  id: string;
  month: string;
  year: number;
  coverImage: string;
  description: string;
  highlights: string[];
  pdfUrl?: string;
  issueNumber: number;
}
