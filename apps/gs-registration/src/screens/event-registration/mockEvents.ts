export type EventStatus = 'available' | 'partial-waitlist' | 'full-waitlist'

export interface GsEvent {
  id: string
  name: string
  type: string
  grades: string[]
  date: string
  dateShort: string
  time: string
  venue: string
  city: string
  zip: string
  price: number
  council: string
  description: string
  spotsTotal: number
  spotsLeft: number
  status: EventStatus
  tags: string[]
  highlights: string[]
  whatToBring: string[]
}

export const MOCK_EVENTS: GsEvent[] = [
  {
    id: 'camp-pinecrest',
    name: 'Camp Pinecrest Summer Day Camp',
    type: 'Camps',
    grades: ['Brownie', 'Junior', 'Cadette'],
    date: 'June 14–18, 2026',
    dateShort: 'Jun 14–18',
    time: '8:00 AM – 4:00 PM',
    venue: 'Camp Pinecrest',
    city: 'Austin, TX',
    zip: '78701',
    price: 125,
    council: 'Girl Scouts of Central Texas',
    description: 'An exciting week of outdoor adventures, badge work, and making new friends at our beautiful Camp Pinecrest facility. Girls will explore nature, build confidence, and develop leadership skills in a safe and fun environment.',
    spotsTotal: 40,
    spotsLeft: 12,
    status: 'available',
    tags: ['Outdoor', 'Multi-day', 'Nature'],
    highlights: ['Swimming & water activities', 'Archery & outdoor skills', 'Badge earning opportunities', 'Evening campfires'],
    whatToBring: ['Closed-toe shoes', 'Sunscreen & bug spray', 'Water bottle', 'Sack lunch daily'],
  },
  {
    id: 'nature-explorers',
    name: 'Nature Explorers Weekend',
    type: 'Camps',
    grades: ['Daisy', 'Brownie', 'Junior'],
    date: 'July 22–23, 2026',
    dateShort: 'Jul 22–23',
    time: '9:00 AM – 5:00 PM',
    venue: 'Barton Creek Greenbelt',
    city: 'Austin, TX',
    zip: '78746',
    price: 75,
    council: 'Girl Scouts of Central Texas',
    description: 'Join us for a two-day nature exploration weekend where girls will discover local wildlife, learn environmental stewardship, and earn the Naturalist badge. Perfect for younger scouts new to the outdoors.',
    spotsTotal: 25,
    spotsLeft: 3,
    status: 'partial-waitlist',
    tags: ['Nature', 'Weekend', 'Badges'],
    highlights: ['Wildlife identification', 'Nature journaling', 'Earn Naturalist badge', 'Guided hikes'],
    whatToBring: ['Comfortable walking shoes', 'Reusable water bottle', 'Light snack', 'Journal & pencil'],
  },
  {
    id: 'stem-science-fair',
    name: 'STEM Science Fair & Workshop',
    type: 'Workshops',
    grades: ['Junior', 'Cadette', 'Senior'],
    date: 'August 5, 2026',
    dateShort: 'Aug 5',
    time: '10:00 AM – 2:00 PM',
    venue: 'Austin Convention Center',
    city: 'Austin, TX',
    zip: '78701',
    price: 15,
    council: 'Girl Scouts of Central Texas',
    description: 'Explore the world of science, technology, engineering, and math through hands-on workshops led by women in STEM careers. Girls will build robots, conduct experiments, and meet inspiring role models.',
    spotsTotal: 100,
    spotsLeft: 47,
    status: 'available',
    tags: ['STEM', 'Indoor', 'One-day'],
    highlights: ['Robotics workshop', 'Meet women in STEM', 'Science experiments', 'Badge opportunities'],
    whatToBring: ['Comfortable clothes', 'Notebook', 'Curiosity!'],
  },
  {
    id: 'cookie-kickoff',
    name: 'Cookie Season Kickoff Celebration',
    type: 'Day Events',
    grades: ['Daisy', 'Brownie', 'Junior', 'Cadette', 'Senior', 'Ambassador'],
    date: 'September 10, 2026',
    dateShort: 'Sep 10',
    time: '6:00 PM – 8:00 PM',
    venue: 'Round Rock Community Center',
    city: 'Round Rock, TX',
    zip: '78664',
    price: 0,
    council: 'Girl Scouts of Central Texas',
    description: "Kick off cookie season with a celebration for all Girl Scouts and their families! Learn about this year's cookie lineup, get tips for selling, and meet other scouts in your community.",
    spotsTotal: 200,
    spotsLeft: 89,
    status: 'available',
    tags: ['Free', 'Family', 'All levels'],
    highlights: ['Cookie previews & tastings', 'Selling tips & strategies', 'Fun games & activities', 'Community connection'],
    whatToBring: ['Your enthusiasm!', 'Troop info (if known)'],
  },
  {
    id: 'leadership-summit',
    name: 'Girl Scout Leadership Summit',
    type: 'Workshops',
    grades: ['Senior', 'Ambassador'],
    date: 'October 1–3, 2026',
    dateShort: 'Oct 1–3',
    time: 'Full weekend program',
    venue: 'Hyatt Regency San Antonio',
    city: 'San Antonio, TX',
    zip: '78205',
    price: 200,
    council: 'Girl Scouts of Central Texas',
    description: 'An immersive three-day leadership development experience for Senior and Ambassador Girl Scouts. Participants will develop public speaking, project management, and community impact skills through workshops, networking, and real-world challenges.',
    spotsTotal: 60,
    spotsLeft: 0,
    status: 'full-waitlist',
    tags: ['Leadership', 'Multi-day', 'Older scouts'],
    highlights: ['Leadership workshops', 'Networking with scouts nationwide', 'Gold Award planning support', 'Career exploration panels'],
    whatToBring: ['Formal attire for gala', 'Business casual for workshops', 'Portfolio/journal', 'Sleeping bag & toiletries'],
  },
  {
    id: 'virtual-coding',
    name: 'Virtual Coding for Beginners',
    type: 'Virtual Events',
    grades: ['Junior', 'Cadette'],
    date: 'August 19, 2026',
    dateShort: 'Aug 19',
    time: '3:00 PM – 5:00 PM',
    venue: 'Online (Zoom)',
    city: 'Virtual',
    zip: '',
    price: 10,
    council: 'Girl Scouts of Central Texas',
    description: 'Learn the basics of coding through fun, creative exercises in this beginner-friendly virtual workshop. No experience needed! Girls will create their first simple program using Scratch and explore how coding shapes our world.',
    spotsTotal: 50,
    spotsLeft: 22,
    status: 'available',
    tags: ['Virtual', 'STEM', 'Beginner-friendly'],
    highlights: ['Intro to Scratch coding', 'Create your first program', 'Q&A with software engineers', 'Take-home resources'],
    whatToBring: ['Computer or tablet', 'Reliable internet connection', 'Scratch account (free, create in advance)'],
  },
]

export const EVENT_TYPES = ['Camps', 'Day Events', 'Workshops', 'Virtual Events', 'Trips & Travel', 'Badge Programs']

export const EVENT_GRADES = [
  { label: 'Daisy', sub: 'Kindergarten – 1st Grade' },
  { label: 'Brownie', sub: '2nd – 3rd Grade' },
  { label: 'Junior', sub: '4th – 5th Grade' },
  { label: 'Cadette', sub: '6th – 8th Grade' },
  { label: 'Senior', sub: '9th – 10th Grade' },
  { label: 'Ambassador', sub: '11th – 12th Grade' },
]
