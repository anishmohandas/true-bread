declare module 'pdf-poppler' {
  export interface ConvertOptions {
    format: 'png' | 'jpeg' | 'tiff' | 'pdf' | 'ps' | 'eps';
    out_dir: string;
    out_prefix: string;
    page?: number | null;
    scale?: number;
    png_quality?: number;
    jpeg_quality?: number;
    tiff_compression?: string;
    density?: number;
  }

  export function convert(pdfPath: string, options: ConvertOptions): Promise<void>;
  export function info(pdfPath: string): Promise<any>;
}
