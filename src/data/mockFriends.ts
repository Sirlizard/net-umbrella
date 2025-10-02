import { Friend } from '../types/Friend';

export const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    contactFrequency: 7,
    bio: 'Amazing UX Designer at TechCorp! Passionate about creating beautiful experiences, loves hiking in nature, capturing life through photography, and discovering the most incredible coffee shops! Always excited for weekend adventures and making memories! ',
    socials: [
      { 
        platform: 'Instagram', 
        handle: '@sarahc_design', 
        lastContacted: new Date(2024, 11, 18),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 11, 10) },
          { type: 'sent', timestamp: new Date(2024, 11, 12) },
          { type: 'received', timestamp: new Date(2024, 11, 15) },
          { type: 'sent', timestamp: new Date(2024, 11, 18) }
        ]
      },
      { 
        platform: 'SMS', 
        handle: '555-0123', 
        lastContacted: new Date(2024, 11, 20),
        messageHistory: [
          { type: 'sent', timestamp: new Date(2024, 11, 16) },
          { type: 'received', timestamp: new Date(2024, 11, 18) },
          { type: 'sent', timestamp: new Date(2024, 11, 20) }
        ]
      },
      { 
        platform: 'WhatsApp', 
        handle: '555-0123', 
        lastContacted: new Date(2024, 11, 15),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 11, 8) },
          { type: 'sent', timestamp: new Date(2024, 11, 10) },
          { type: 'received', timestamp: new Date(2024, 11, 15) }
        ]
      }
    ],
    lastContacted: new Date(2024, 11, 20) // 3 days ago
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    contactFrequency: 5,
    bio: 'Incredible full-stack developer and gaming enthusiast! Currently creating an amazing indie game that will blow your mind! Always excited for epic coding sessions and unforgettable gaming nights with friends! ',
    socials: [
      { 
        platform: 'Twitter', 
        handle: '@marcusj_dev', 
        lastContacted: new Date(2024, 11, 10),
        messageHistory: [
          { type: 'sent', timestamp: new Date(2024, 11, 5) },
          { type: 'received', timestamp: new Date(2024, 11, 10) }
        ]
      },
      { 
        platform: 'SMS', 
        handle: '555-0456', 
        lastContacted: new Date(2024, 11, 15),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 11, 12) },
          { type: 'sent', timestamp: new Date(2024, 11, 15) }
        ]
      },
      { 
        platform: 'Discord', 
        handle: 'Marcus#1234', 
        lastContacted: new Date(2024, 11, 12),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 11, 8) },
          { type: 'sent', timestamp: new Date(2024, 11, 10) },
          { type: 'received', timestamp: new Date(2024, 11, 12) }
        ]
      }
    ],
    lastContacted: new Date(2024, 11, 15) // 8 days ago
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    contactFrequency: 3,
    bio: 'Inspiring travel blogger and incredible photographer! Currently having the adventure of a lifetime exploring the beautiful Southeast Asia! Loves sharing amazing travel tips and breathtaking photography that captures the magic of our wonderful world! ',
    socials: [
      { 
        platform: 'Instagram', 
        handle: '@elena.travels', 
        lastContacted: new Date(2024, 10, 28),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 10, 20) },
          { type: 'sent', timestamp: new Date(2024, 10, 25) },
          { type: 'received', timestamp: new Date(2024, 10, 28) }
        ]
      },
      { 
        platform: 'SMS', 
        handle: '555-0789', 
        lastContacted: new Date(2024, 10, 25),
        messageHistory: [
          { type: 'sent', timestamp: new Date(2024, 10, 22) },
          { type: 'received', timestamp: new Date(2024, 10, 25) }
        ]
      },
      { 
        platform: 'Facebook', 
        handle: 'elena.rodriguez.99', 
        lastContacted: new Date(2024, 10, 20),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 10, 15) },
          { type: 'sent', timestamp: new Date(2024, 10, 20) }
        ]
      }
    ],
    lastContacted: new Date(2024, 10, 28) // 26 days ago
  },
  {
    id: '4',
    name: 'Alex Thompson',
    contactFrequency: 8,
    bio: 'Brilliant freelance writer and passionate book lover! Specializes in amazing tech journalism and creative writing that inspires! Always has the most incredible book recommendations that will change your life! Loves sharing stories and knowledge! ',
    socials: [
      { 
        platform: 'LinkedIn', 
        handle: 'alex-thompson-writer', 
        lastContacted: new Date(2024, 9, 15),
        messageHistory: [
          { type: 'sent', timestamp: new Date(2024, 9, 10) },
          { type: 'received', timestamp: new Date(2024, 9, 15) }
        ]
      },
      { 
        platform: 'SMS', 
        handle: '555-0321', 
        lastContacted: new Date(2024, 9, 10),
        messageHistory: [
          { type: 'received', timestamp: new Date(2024, 9, 5) },
          { type: 'sent', timestamp: new Date(2024, 9, 10) }
        ]
      },
      { 
        platform: 'Email', 
        handle: 'alex.thompson@email.com', 
        lastContacted: new Date(2024, 9, 8),
        messageHistory: [
          { type: 'sent', timestamp: new Date(2024, 9, 1) },
          { type: 'received', timestamp: new Date(2024, 9, 8) }
        ]
      }
    ],
    lastContacted: new Date(2024, 9, 15) // 2 months ago
  }
];