

export type ActivityType = 'Running' | 'Cycling' | 'Hiking' | 'Yoga' | 'Boxing' | 'Skating' | 'Football' | 'Badminton' | 'Golf' | 'Tennis' | 'Swimming' | 'Tabata' | 'Zumba' | 'Walking';

export interface EventMetrics {
  distanceKm: number;
  duration: string;
  calories: number;
  pace: string;
}

export interface Organizer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  bio: string;
  isVerified?: boolean;
}

export interface Event {
  id: string;
  title: string;
  club: string;
  organizer?: Organizer;
  type: ActivityType;
  date: string;
  time: string;
  location: string;
  attendees: number;
  image: string;
  description: string;
  isJoined?: boolean;
  status: 'upcoming' | 'active' | 'completed';
  metrics?: EventMetrics;
  price?: number;
  currency?: string;
  leaderboard?: GroupMember[];
}

export interface UserGoal {
  type: 'Weekly' | 'Monthly';
  targetDistanceKm: number;
  currentDistanceKm: number;
  streakDays: number;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  earnedDate: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  badges: Badge[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
  suggestions?: Event[];
}

// Virtual Group Types
export interface GroupMember extends User {
  status: 'ready' | 'active' | 'finished';
  currentDistance: number; 
  currentPace?: string;
  location: string;
  finalMetrics?: EventMetrics;
}

export interface GroupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface GroupSessionSummary {
  id: string;
  title: string;
  date: string;
  activityType: ActivityType;
  distance: number;
}

export interface GroupStats {
  totalDistance: number;
  totalSessions: number;
  totalCalories: number;
}

export interface GroupMilestone {
  id: string;
  name: string;
  icon: string; // Lucide icon name mapped in component
  description: string;
  unlockedAt: string;
}

export interface VirtualGroup {
  id: string;
  title: string;
  activityType: ActivityType;
  targetDistance: number;
  startTime: string;
  adminId: string;
  members: GroupMember[];
  status: 'recruiting' | 'active' | 'completed';
  spotifyPlaylistUrl?: string;
  chatHistory: GroupChatMessage[];
  pastSessions?: GroupSessionSummary[];
  stats: GroupStats;
  milestones: GroupMilestone[];
}