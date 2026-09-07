import { useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import {
  GettingStartedGuide,
  HelpFaqSection,
  HelpPageHeader,
  QuickHelpGrid,
} from '../../components/help/HelpSupportSections'

export default function HelpSupport() {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <DashboardLayout pageTitle="Help & Support">
      <div className="page-enter space-y-6">
        <HelpPageHeader />

        <QuickHelpGrid onOpenGuide={() => setGuideOpen(true)} />

        <HelpFaqSection />
      </div>

      <GettingStartedGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </DashboardLayout>
  )
}
