export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minStayDays?: number;
}

export interface Review {
  id: string;
  propertyId: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
}

export const ACTIVE_COUPONS: Coupon[] = [
  { code: 'WELCOME10', description: 'Get 10% flat off on any booking!', discountType: 'percentage', discountValue: 10 },
  { code: 'STAYSAFE', description: 'Co-living special! ₹1,500 off on PG stays.', discountType: 'fixed', discountValue: 1500 },
  { code: 'LONGSTAY', description: 'Super Saver! 15% discount for stays above 7 days.', discountType: 'percentage', discountValue: 15, minStayDays: 7 }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    propertyId: 'prop-1',
    userName: 'Riya Shen',
    rating: 5,
    date: '2026-05-18',
    comment: 'Extremely hygienic rooms, helpful wardens, and high-speed fiber internet which is perfect for my WFH schedule. Will extend my stay next month!',
    helpfulCount: 14
  },
  {
    id: 'rev-2',
    propertyId: 'prop-1',
    userName: 'Kunal Kapoor',
    rating: 4,
    date: '2026-05-11',
    comment: 'Cozy beds and nice study tables in Room 101. The breakfast board has good variety. Only minor issue is parking space fills up quickly.',
    helpfulCount: 5
  },
  {
    id: 'rev-3',
    propertyId: 'prop-2',
    userName: 'Vikram Grover',
    rating: 5,
    date: '2026-05-22',
    comment: 'An absolutely stellar hotel standard. Courteous staff, top-tier pool, and great workstation desk options. Gachibowli DLF core proximity is a huge plus.',
    helpfulCount: 22
  },
  {
    id: 'rev-4',
    propertyId: 'prop-2',
    userName: 'Ananya Deshmukh',
    rating: 4,
    date: '2026-05-09',
    comment: 'Wonderful room service and highly responsive support. Enjoyed my complimentary breakfast buffet immensely.',
    helpfulCount: 9
  },
  {
    id: 'rev-5',
    propertyId: 'prop-3',
    userName: 'Amit Kumar',
    rating: 5,
    date: '2026-05-15',
    comment: 'Awesome co-living. The PlayStation lounge makes it very easy to network with fellow residents. Gate security is biometric and very tech-savvy!',
    helpfulCount: 18
  }
];

// High-quality interactive image list for property sliders
export const PROPERTY_IMAGES: Record<string, string[]> = {
  'prop-1': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600'
  ],
  'prop-2': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    'https://images.unsplash.com/photo-1582719478250-c89cae4db85b?w=600',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600'
  ],
  'prop-3': [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
    'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=600'
  ]
};

export const DEFAULT_PROPERTY_ROOM_IMAGE = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600';
