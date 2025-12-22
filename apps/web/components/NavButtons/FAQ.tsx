import { routes } from '@eptss/routing'
import { NavigationButton } from '@eptss/ui'

export const FAQButton = () => (
  <NavigationButton href={routes.faq()} intent="main">
    FAQ
  </NavigationButton>
)
