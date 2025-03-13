import { Navigation } from '@/enum/navigation'
import { NavigationButton } from '../ui/navigation-button'

export const FAQButton = () => (
  <NavigationButton href={Navigation.FAQ} intent="main">
    FAQ
  </NavigationButton>
)
