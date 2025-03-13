import * as React from 'react'
import { Toolbar, ToolbarButtonGroup } from '../ui/primitives'

interface ButtonsContainerProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const ButtonsContainer = ({
  children,
  orientation = 'horizontal',
  className,
}: ButtonsContainerProps) => {
  return (
    <Toolbar className={className}>
      <ToolbarButtonGroup orientation={orientation}>
        {children}
      </ToolbarButtonGroup>
    </Toolbar>
  )
}
