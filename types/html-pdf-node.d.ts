declare module 'html-pdf-node' {
  export interface Options {
    format?: string;
    path?: string;
    landscape?: boolean;
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
    scale?: number;
    width?: number | string;
    height?: number | string;
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    pageRanges?: string;
  }

  export interface File {
    content?: string;
    path?: string;
    url?: string;
  }

  export function generatePdf(file: File, options: Options): Promise<Buffer>;
  export function generatePdfs(files: File[], options: Options): Promise<Buffer[]>;
  
  const htmlPdf: {
    generatePdf: typeof generatePdf;
    generatePdfs: typeof generatePdfs;
  };
  
  export default htmlPdf;
}