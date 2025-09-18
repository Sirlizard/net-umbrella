export interface Friend {
  id: string;
  name: string;
  bio?: string;
  socials: SocialLink[];
  lastContacted: Date;
}

export interface SocialLink {
  platform: string;
  handle: string;
  lastContacted?: Date;
  messageHistory: MessageRecord[];
}

export interface MessageRecord {
  type: 'sent' | 'received';
  timestamp: Date;
}