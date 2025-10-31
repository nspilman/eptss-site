import React from 'react';

// Mock Next.js Link component for Storybook
const Link = React.forwardRef<HTMLAnchorElement, any>(
  ({ children, href, onClick, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (onClick) onClick(e);
        }}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'NextLink';

export default Link;
