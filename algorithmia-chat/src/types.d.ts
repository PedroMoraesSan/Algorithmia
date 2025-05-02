
export interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant';
  format?: 'descriptive' | 'pseudocode' | 'flowchart';
  timestamp: string;
}

export interface FormatOption {
  value: 'descriptive' | 'pseudocode' | 'flowchart';
  label: string;
}

export interface ModelOption {
  value: string;
  label: string;
}
