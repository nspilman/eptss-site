import React from 'react'
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import BottomNav from "./BottomNav";


interface TopNavProps {
  userId: string;
}

const TopNav: React.FC<TopNavProps> = ({ userId }) => {
  // You can use the userId prop here to customize the TopNav component
  return (
    <div className="top-nav">
      {/* Example usage of userId */}
      <p>Welcome, {userId}!</p>
      {/* Add your other top navigation elements here */}
    </div>
  );
};

export default TopNav;

{/* <NavigationMenu >
<NavigationMenuList>
  <NavigationMenuItem>
    <NavigationMenuTrigger>About</NavigationMenuTrigger>
    <NavigationMenuContent>
      <ul className="grid w-[200px] gap-3 p-4 ">
        {about.map((about) => (
          <ListItem
            key={about.title}
            title={about.title}
            href={about.href}
          >
            {about.description}
          </ListItem>
        ))}
      </ul>
    </NavigationMenuContent>
  </NavigationMenuItem>
  <NavigationMenuItem>
    <Link href="/docs" legacyBehavior passHref>
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
        Studio
      </NavigationMenuLink>
    </Link>
  </NavigationMenuItem>{" "}
  <NavigationMenuItem>
    <Link href="/docs" legacyBehavior passHref>
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
        Login
      </NavigationMenuLink>
    </Link>
  </NavigationMenuItem>
</NavigationMenuList>
</NavigationMenu>
</div> */}

// const ListItem = React.forwardRef<
//   React.ElementRef<"a">,
//   React.ComponentPropsWithoutRef<"a">
// >(({ className, title, children, ...props }, ref) => {
//   return (
//     <li>
//       <NavigationMenuLink asChild>
//         <a
//           ref={ref}
//           className={cn(
//             "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
//             className
//           )}
//           {...props}
//         >
//           <div className="text-sm font-medium leading-none">{title}</div>
//           <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
//             {children}
//           </p>
//         </a>
//       </NavigationMenuLink>
//     </li>
//   );
// });
// ListItem.displayName = "ListItem";