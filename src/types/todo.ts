export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type FilterType = 'all' | 'active' | 'completed';

export interface StorageData {
  schemaVersion: number;
  tasks: Task[];
}

export interface DeletedTaskRecord {
  task: Task;
  originalIndex: number;
}
