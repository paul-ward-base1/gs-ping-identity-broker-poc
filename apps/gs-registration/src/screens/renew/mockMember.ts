export type MembershipStatus = 'active' | 'expiring-soon' | 'expired'

export interface MembershipRecord {
  id: string
  type: string
  memberId: string
  girlScout: { firstName: string; lastName: string; grade: string }
  expiry: string
  expiryDate: Date
  status: MembershipStatus
  councilCode: string
}

export interface MemberAccount {
  firstName: string
  lastName: string
  email: string
  phone: string
  council: string
  memberships: MembershipRecord[]
}

export const MOCK_MEMBER: MemberAccount = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@email.com',
  phone: '(512) 555-0142',
  council: 'Girl Scouts of Central Texas',
  memberships: [
    {
      id: 'mem-001',
      type: 'Girl Scout Annual Membership',
      memberId: 'GS-78934521',
      girlScout: { firstName: 'Emma', lastName: 'Smith', grade: '3rd Grade' },
      expiry: 'December 31, 2025',
      expiryDate: new Date('2025-12-31'),
      status: 'expired',
      councilCode: 'TX-CENTRAL',
    },
  ],
}

export const RENEW_PRODUCTS = [
  {
    id: 'annual',
    name: 'Girl Scout Annual Membership',
    description: 'One-year membership renewal with access to all troop activities, events, and Girl Scout resources.',
    price: 25,
    duration: '1 year',
    newExpiry: 'December 31, 2026',
    isRecommended: true,
  },
  {
    id: 'multi-year',
    name: 'Girl Scout Multi-Year Membership',
    description: 'Two-year membership renewal at a discounted rate. Great for returning Girl Scouts.',
    price: 45,
    duration: '2 years',
    newExpiry: 'December 31, 2027',
    isRecommended: false,
  },
]
