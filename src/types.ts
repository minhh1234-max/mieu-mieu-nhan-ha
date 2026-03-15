export type StoryType = 'comic' | 'novel';
export type StoryStatus = 'ongoing' | 'completed';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string;
  type: StoryType;
  status: StoryStatus;
  viewCount: number;
  followerCount: number;
  categoryIds: string[];
  isHot?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isOriginal?: boolean;
  lastChapterTitle?: string;
  lastChapterId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  chapterNumber: number;
  content?: string; // For novels
  images?: string[]; // For comics
  viewCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  likeCount: number;
  parentId?: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  userId: string;
  storyId: string;
  createdAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  lastReadAt: string;
}
