
export interface Case {
  id: number;
  title: string;
  author: string;
  category: string;
  inputImages: string[];
  outputImage: string;
  prompt: string;
  inputsNeeded: number;
  note?: string;
}
