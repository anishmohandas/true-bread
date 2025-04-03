export interface Issue {
  id: string;
  month: string;
  coverImage: string;
  description: string;
  highlights: string[];
  pdfUrl?: string;
  issueNumber: number;
}
