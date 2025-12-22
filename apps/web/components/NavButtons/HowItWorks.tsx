import { routes } from '@eptss/routing'
import { NavigationButton } from '@eptss/ui'

export const HowItWorksButton = () => (
  <NavigationButton href={routes.home({ hash: 'how-it-works' })} intent="ghost">
    How It Works
  </NavigationButton>
)
