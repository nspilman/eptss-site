import { Navigation } from '@/enum/navigation'
import { NavigationButton } from '@eptss/ui'

export const HowItWorksButton = () => (
  <NavigationButton href={Navigation.HowItWorks} intent="ghost">
    How It Works
  </NavigationButton>
)
