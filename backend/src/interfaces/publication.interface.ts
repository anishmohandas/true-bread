export interface Publication {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
  publishDate: Date;
  month: string;
  year: number;
  highlights: string[];
  issueNumber: number;
}
