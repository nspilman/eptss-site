import { ComponentPropsWithoutRef, ElementRef, ComponentPropsWithRef } from 'react'
import { Slot } from '@radix-ui/react-slot'

export type PrimitivePropsWithRef<E extends React.ElementType> = ComponentPropsWithRef<E> & {
  asChild?: boolean
}

export type PrimitivePropsWithoutRef<E extends React.ElementType> = ComponentPropsWithoutRef<E> & {
  asChild?: boolean
}

export type SlottableProps<T extends React.ElementType> = {
  asChild?: boolean
} & Omit<ComponentPropsWithoutRef<T>, 'asChild'>

export type WithDisplayName<T> = T & { displayName?: string }
