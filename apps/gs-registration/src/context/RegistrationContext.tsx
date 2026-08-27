import { createContext, useContext, useState, ReactNode } from 'react'

export interface RegistrationData {
  // Girl Scout
  girlFirstName: string
  girlLastName: string
  grade: string
  girlDob: string
  school: string
  girlEthnicity: string
  girlRace: string

  // Caregiver
  caregiverFirstName: string
  caregiverLastName: string
  caregiverEmail: string
  caregiverPhone: string
  country: string
  smsOptIn: boolean
  emailOptIn: boolean

  // Address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string

  // Payment
  girlPaymentMethod: string
  caregiverPaymentMethod: string

  // Membership
  membershipProduct: string
  caregiverMembershipProduct: string
  caregiverMembershipPrice: number
  councilCode: string
  councilName: string
  membershipPrice: number

  // Troop invitation flow
  invitationCode: string
  troopId: string
  troopName: string
  troopLeader: string
  troopCity: string
  troopGrade: string
  troopGradeRange: string
  troopAssociation: string
  selectedTroopName: string

  // Girl residence (troop search — independent of caregiver address)
  girlResidenceZip: string
  girlResidenceCity: string
  girlResidenceState: string
  girlResidenceCountry: string

  // Renew membership flow
  renewSelectedMemberships: string[]
  renewProduct: string
  renewPrice: number
  renewNewExpiry: string

  // Event registration flow
  eventZip: string
  eventTypes: string[]
  eventGrades: string[]
  selectedEventId: string
  selectedEventName: string
  selectedEventDate: string
  selectedEventVenue: string
  selectedEventCity: string
  selectedEventPrice: number
  selectedEventCouncil: string
}

const defaultData: RegistrationData = {
  girlFirstName: '',
  girlLastName: '',
  grade: '',
  girlDob: '',
  school: '',
  girlEthnicity: '',
  girlRace: '',
  caregiverFirstName: '',
  caregiverLastName: '',
  caregiverEmail: '',
  caregiverPhone: '',
  country: 'USA',
  smsOptIn: false,
  emailOptIn: false,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  girlPaymentMethod: '',
  caregiverPaymentMethod: '',
  membershipProduct: '',
  caregiverMembershipProduct: '',
  caregiverMembershipPrice: 0,
  councilCode: '',
  councilName: '',
  membershipPrice: 0,
  renewSelectedMemberships: [],
  renewProduct: '',
  renewPrice: 0,
  renewNewExpiry: '',
  invitationCode: '',
  troopId: '',
  troopName: '',
  troopLeader: '',
  troopCity: '',
  troopGrade: '',
  troopGradeRange: '',
  troopAssociation: '',
  selectedTroopName: '',
  girlResidenceZip: '',
  girlResidenceCity: '',
  girlResidenceState: '',
  girlResidenceCountry: '',
  eventZip: '',
  eventTypes: [],
  eventGrades: [],
  selectedEventId: '',
  selectedEventName: '',
  selectedEventDate: '',
  selectedEventVenue: '',
  selectedEventCity: '',
  selectedEventPrice: 0,
  selectedEventCouncil: '',
}

export interface RegistrationMeta {
  existingCaregiver: boolean
  existingCaregiverWithFA: boolean
  onlyFinancialAid: boolean
  isMixed: boolean
  showFinancialAidBanner: boolean
  hasTroop: boolean
  caregiverMembershipRoute: string
}

interface RegistrationContextType {
  data: RegistrationData
  meta: RegistrationMeta
  update: (fields: Partial<RegistrationData>) => void
  reset: () => void
}

const RegistrationContext = createContext<RegistrationContextType | null>(null)

function computeMeta(data: RegistrationData): RegistrationMeta {
  const existingCaregiver =
    data.caregiverFirstName.trim().toLowerCase() === 'janet' &&
    data.caregiverLastName.trim().toLowerCase() === 'lewis'

  const onlyFinancialAid =
    data.girlPaymentMethod === 'financial-aid' &&
    data.caregiverPaymentMethod === 'financial-aid'

  const hasCreditCard = data.girlPaymentMethod === 'credit-card' || data.caregiverPaymentMethod === 'credit-card'
  const hasFinancialAid = data.girlPaymentMethod === 'financial-aid' || data.caregiverPaymentMethod === 'financial-aid'
  const isMixed = hasCreditCard && hasFinancialAid

  const existingCaregiverWithFA = existingCaregiver && data.girlPaymentMethod === 'financial-aid'
  const showFinancialAidBanner = onlyFinancialAid || existingCaregiverWithFA

  return {
    existingCaregiver,
    existingCaregiverWithFA,
    onlyFinancialAid,
    isMixed,
    showFinancialAidBanner,
    hasTroop: data.selectedTroopName.length > 0,
    caregiverMembershipRoute: existingCaregiver ? '/membership' : '/caregiver-membership',
  }
}

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>(defaultData)

  const update = (fields: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...fields }))
  }

  const reset = () => setData(defaultData)

  return (
    <RegistrationContext.Provider value={{ data, meta: computeMeta(data), update, reset }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext)
  if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider')
  return ctx
}
