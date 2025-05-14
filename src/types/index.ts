export interface Task {
  id: string;
  title: string;
  description?: string;
  starred: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  userId: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  userId: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface TaskStats {
  date: string;
  count: number;
}