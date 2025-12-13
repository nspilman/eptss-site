import * as React from 'react'
import { ButtonsContainer } from '../ButtonsContainer'
import { FAQButton } from './FAQ'
import { HowItWorksButton } from './HowItWorks'

export const Navigation = () => {
  return (
    <ButtonsContainer orientation="horizontal" className="gap-4">
      <HowItWorksButton />
      <FAQButton />
    </ButtonsContainer>
  )
}
