export type Status = 'done' | 'in-progress' | 'pending';

export interface FileAttachment {
  id: string;
  name: string;
  uri: string;       // local file:// URI
  mimeType: string;
  size: number;      // bytes
  addedAt: string;   // ISO date
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
}

export type RepeatConfig = 'none' | 'daily' | 'weekly';

export interface NotificationConfig {
  isActive: boolean;
  datetime: string | null;
  repeat: RepeatConfig;
  daysOfWeek?: number[];
  notificationId?: string;
}

export interface Todo {
  id: string;
  objectiveId: string;
  name: string;
  status: Status;
  startDate: string | null;
  endDate: string | null;
  location?: string;
  notes?: string;
  isArchived: boolean;
  order: number;
  notificationConfig?: NotificationConfig;
  attachments?: FileAttachment[];
}

export interface Objective {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
}

export interface ThemeColors {
  done: string;
  inProgress: string;
  pending: string;
  backgroundMain: string;
  cardStart: string;
  cardEnd: string;
  text: string;
  accent: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
}
