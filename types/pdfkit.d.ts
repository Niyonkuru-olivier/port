declare module 'pdfkit' {
  import { Readable } from 'stream';

  interface DocumentOptions {
    margin?: number;
    size?: string | [number, number];
    layout?: 'portrait' | 'landscape';
  }

  export default class PDFDocument extends Readable {
    y?: number;
    page: { width: number; height: number };
    
    constructor(options?: DocumentOptions);
    
    image(path: string, x: number, y: number, options?: any): void;
    text(content: string, options?: any): void;
    fontSize(size: number): this;
    font(name: string): this;
    moveDown(n?: number): this;
    rect(x: number, y: number, width: number, height: number): this;
    stroke(): this;
    addPage(): void;
    end(): void;
    pipe(dest: any): void;
  }
}

