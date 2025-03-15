import { Navigation } from '@/enum/navigation'
import { NavigationButton } from '../ui/navigation-button'

export const HowItWorksButton = () => (
  <NavigationButton href={Navigation.HowItWorks} intent="ghost">
    How It Works
  </NavigationButton>
)
