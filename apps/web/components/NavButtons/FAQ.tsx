import { Navigation } from '@/enum/navigation'
import { NavigationButton } from '@eptss/ui'

export const FAQButton = () => (
  <NavigationButton href={Navigation.FAQ} intent="main">
    FAQ
  </NavigationButton>
)
