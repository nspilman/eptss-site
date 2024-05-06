"use client";

import * as React from "react";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

interface AboutMenuRoutes {
  title: string;
  href: string;
  description: string;
}

interface UserIdProp {
  userId: string
}

const about: { title: string; href: string; description: string }[] = [
  {
    title: "FAQ",
    href: "/faq",
    description: "How does this work?",
  },
  {
    title: "Blog",
    href: "/blog",
    description: "What's new?!",
  },
];


const NavMenus: React.FC<UserIdProp> = ({ userId }) => {
  userId ='booty'
  return (
    <>
      <TopNav userId={userId} about={about} />
      <BottomNav userId={userId} about={about} />
    </>
  );
};

export default NavMenus;
