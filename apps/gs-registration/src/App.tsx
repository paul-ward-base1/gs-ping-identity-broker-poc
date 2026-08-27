import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from 'react-oidc-context'
import { oidcConfig } from './auth/oidc-config'
import { AuthCallback } from './auth/AuthCallback'
import { PostSignoff } from './auth/PostSignoff'
import { RegistrationProvider } from './context/RegistrationContext'
import { Home } from './screens/Home'
import { GirlScoutSplash } from './screens/GirlScoutSplash'
import { GirlsName } from './screens/GirlsName'
import { Schooling } from './screens/Schooling'
import { CaregiverName } from './screens/CaregiverName'
import { CaregiverEmail } from './screens/CaregiverEmail'
import { CaregiverAddress } from './screens/CaregiverAddress'
import { CaregiverPhone } from './screens/CaregiverPhone'
import { MembershipOptions } from './screens/MembershipOptions'
import { CaregiverMembership } from './screens/CaregiverMembership'
import { GirlsRaceEthnicity } from './screens/GirlsRaceEthnicity'
import { Cart } from './screens/Cart'
import { CheckoutAs } from './screens/CheckoutAs'
import { Payment } from './screens/Payment'
import { Confirmation } from './screens/Confirmation'
// Renew membership flow
import { RenewEntry } from './screens/renew/RenewEntry'
import { RenewAccount } from './screens/renew/RenewAccount'
import { RenewSelectMemberships } from './screens/renew/RenewSelectMemberships'
import { RenewMembership } from './screens/renew/RenewMembership'
import { RenewCart } from './screens/renew/RenewCart'
import { RenewPayment } from './screens/renew/RenewPayment'
import { RenewConfirmation } from './screens/renew/RenewConfirmation'
import { RenewNoAccount } from './screens/renew/RenewNoAccount'
// Event registration flow
import { EventLanding } from './screens/event-registration/EventLanding'
import { EventLocation } from './screens/event-registration/EventLocation'
import { EventType } from './screens/event-registration/EventType'
import { EventGrades } from './screens/event-registration/EventGrades'
import { EventResults } from './screens/event-registration/EventResults'
import { EventDetail } from './screens/event-registration/EventDetail'
import { EventCheckout } from './screens/event-registration/EventCheckout'
import { EventPayment } from './screens/event-registration/EventPayment'
import { EventConfirmation } from './screens/event-registration/EventConfirmation'
import { EventWaitlist } from './screens/event-registration/EventWaitlist'
import { EventWaitlistConfirmation } from './screens/event-registration/EventWaitlistConfirmation'
// Troop invitation flow
import { TroopEnrolment } from './screens/join-troop/TroopEnrolment'
import { TroopRaceEthnicity } from './screens/join-troop/TroopRaceEthnicity'
import { KnowTroop } from './screens/join-troop/KnowTroop'
import { FindTroop } from './screens/join-troop/FindTroop'
import { ChooseTroop } from './screens/join-troop/ChooseTroop'
import { TroopGirlsName } from './screens/join-troop/TroopGirlsName'
import { TroopSchooling } from './screens/join-troop/TroopSchooling'
import { TroopCaregiverName } from './screens/join-troop/TroopCaregiverName'
import { TroopCaregiverEmail } from './screens/join-troop/TroopCaregiverEmail'
import { TroopCaregiverAddress } from './screens/join-troop/TroopCaregiverAddress'
import { TroopCaregiverPhone } from './screens/join-troop/TroopCaregiverPhone'
import { TroopContactMethod } from './screens/join-troop/TroopContactMethod'
import { TroopContactEmail } from './screens/join-troop/TroopContactEmail'
import { TroopContactName } from './screens/join-troop/TroopContactName'
import { TroopGirlResidence } from './screens/join-troop/TroopGirlResidence'
import { TroopFindSearch } from './screens/join-troop/TroopFindSearch'
import { TroopResults } from './screens/join-troop/TroopResults'
import { TroopContactSchool } from './screens/join-troop/TroopContactSchool'
import { TroopContactComments } from './screens/join-troop/TroopContactComments'
import { TroopContactConfirmation } from './screens/join-troop/TroopContactConfirmation'
import { TroopContactPhone } from './screens/join-troop/TroopContactPhone'
import {
  LeadNoMatch,
  LeadEmail,
  LeadName,
  LeadZip,
  LeadSchool,
  LeadComments,
  LeadConfirmation,
} from './screens/join-troop/LeadCapture'
import { useSessionRevocation } from './hooks/useSessionRevocation'
import { useSilentSso } from './hooks/useSilentSso'
import './styles/global.css'

function SessionRevocationGuard({ children }: { children: React.ReactNode }) {
  useSessionRevocation();
  useSilentSso();
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider {...oidcConfig}>
    <SessionRevocationGuard>
    <BrowserRouter>
      <RegistrationProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/callback" element={<AuthCallback />} />
            <Route path="/post-signoff" element={<PostSignoff />} />
            {/* Renew membership flow */}
            <Route path="/renew" element={<RenewEntry />} />
            <Route path="/renew/account" element={<RenewAccount />} />
            <Route path="/renew/select" element={<RenewSelectMemberships />} />
            <Route path="/renew/membership" element={<RenewMembership />} />
            <Route path="/renew/cart" element={<RenewCart />} />
            <Route path="/renew/payment" element={<RenewPayment />} />
            <Route path="/renew/confirmation" element={<RenewConfirmation />} />
            <Route path="/renew/no-account" element={<RenewNoAccount />} />

            {/* Event registration flow */}
            <Route path="/register-event" element={<EventLanding />} />
            <Route path="/register-event/location" element={<EventLocation />} />
            <Route path="/register-event/type" element={<EventType />} />
            <Route path="/register-event/grades" element={<EventGrades />} />
            <Route path="/register-event/results" element={<EventResults />} />
            <Route path="/register-event/event/:id" element={<EventDetail />} />
            <Route path="/register-event/checkout" element={<EventCheckout />} />
            <Route path="/register-event/payment" element={<EventPayment />} />
            <Route path="/register-event/confirmation" element={<EventConfirmation />} />
            <Route path="/register-event/waitlist" element={<EventWaitlist />} />
            <Route path="/register-event/waitlist/confirmation" element={<EventWaitlistConfirmation />} />

            {/* Girl Scout First flow */}
            <Route path="/" element={<GirlScoutSplash />} />
            <Route path="/start" element={<Home />} />
            <Route path="/register" element={<GirlScoutSplash />} />
            <Route path="/register/girls-name" element={<GirlsName />} />
            <Route path="/register/schooling" element={<Schooling />} />
            <Route path="/register/caregiver-name" element={<CaregiverName />} />
            <Route path="/register/caregiver-email" element={<CaregiverEmail />} />
            <Route path="/register/caregiver-address" element={<CaregiverAddress />} />
            <Route path="/register/caregiver-phone" element={<CaregiverPhone />} />

            {/* Troop invitation flow — entry via QR code URL e.g. /join-troop?troop=123456 */}
            <Route path="/join-troop" element={<TroopEnrolment />} />
            <Route path="/join-troop/know-troop" element={<KnowTroop />} />
            <Route path="/join-troop/find-troop" element={<FindTroop />} />
            <Route path="/join-troop/choose-troop" element={<ChooseTroop />} />
            <Route path="/join-troop/girls-name" element={<TroopGirlsName />} />
            <Route path="/join-troop/schooling" element={<TroopSchooling />} />
            <Route path="/join-troop/caregiver-name" element={<TroopCaregiverName />} />
            <Route path="/join-troop/caregiver-email" element={<TroopCaregiverEmail />} />
            <Route path="/join-troop/caregiver-address" element={<TroopCaregiverAddress />} />
            <Route path="/join-troop/caregiver-phone" element={<TroopCaregiverPhone />} />
            <Route path="/join-troop/race-ethnicity" element={<TroopRaceEthnicity />} />

            {/* Lead capture sub-flow */}
            <Route path="/join-troop/contact-method" element={<TroopContactMethod />} />
            <Route path="/join-troop/contact-email" element={<TroopContactEmail />} />
            <Route path="/join-troop/contact-name" element={<TroopContactName />} />
            <Route path="/join-troop/girl-residence" element={<TroopGirlResidence />} />
            <Route path="/join-troop/find-search" element={<TroopFindSearch />} />
            <Route path="/join-troop/troop-results" element={<TroopResults />} />
            <Route path="/join-troop/contact-school" element={<TroopContactSchool />} />
            <Route path="/join-troop/contact-comments" element={<TroopContactComments />} />
            <Route path="/join-troop/contact-phone" element={<TroopContactPhone />} />
            <Route path="/join-troop/contact-confirmation" element={<TroopContactConfirmation />} />
            <Route path="/join-troop/no-match" element={<LeadNoMatch />} />
            <Route path="/join-troop/lead/email" element={<LeadEmail />} />
            <Route path="/join-troop/lead/name" element={<LeadName />} />
            <Route path="/join-troop/lead/zip" element={<LeadZip />} />
            <Route path="/join-troop/lead/school" element={<LeadSchool />} />
            <Route path="/join-troop/lead/comments" element={<LeadComments />} />
            <Route path="/join-troop/lead/confirmation" element={<LeadConfirmation />} />

            {/* Shared checkout flow */}
            <Route path="/register/girls-race-ethnicity" element={<GirlsRaceEthnicity />} />
            <Route path="/membership" element={<MembershipOptions />} />
            <Route path="/caregiver-membership" element={<CaregiverMembership />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout-as" element={<CheckoutAs />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation" element={<Confirmation />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </RegistrationProvider>
    </BrowserRouter>
    </SessionRevocationGuard>
    </AuthProvider>
  )
}
