import React from 'react'
import Link from 'next/link'
import { Navigation } from 'components/enum/navigation'

interface ButtonProps {
  href: Navigation;
  title: string;
}
 export const Button = ({ href, title }: ButtonProps): React.ReactElement => {
  return (
    <Link href={href}>
      <button className="btn-main">
        {title}
      </button>
    </Link>  )
}

