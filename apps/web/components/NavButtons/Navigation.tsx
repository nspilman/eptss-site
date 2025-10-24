import * as React from 'react'
import { ButtonsContainer } from '../ButtonsContainer'
import { FAQButton } from './FAQ'
import { HowItWorksButton } from './HowItWorks'
import { RoundsButton } from './Rounds'

export const Navigation = () => {
  return (
    <ButtonsContainer orientation="horizontal" className="gap-4">
      <RoundsButton />
      <HowItWorksButton />
      <FAQButton />
    </ButtonsContainer>
  )
}
