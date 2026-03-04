export type DocumentId = string;

export interface DocumentItem {
  id: DocumentId;
  name: string;
  text: string;
  createdAt: number;
}

