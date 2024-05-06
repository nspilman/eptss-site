"use client";

import React from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

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

interface Props {
  userId: string;
}

export const NavMenus = ({ userId }: Props): React.ReactElement => {
  return (
    <>
      <TopNav userId={userId} about={about} />
      <BottomNav userId={userId} about={about} />
    </>
  );
};
