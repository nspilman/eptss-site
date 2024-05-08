"use client";

import React from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

interface Props {
  userId: string;
}

export const NavMenus = ({ userId }: Props): React.ReactElement => {
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
  return (
    <>
      <TopNav userId={userId} about={about} />
      <BottomNav userId={userId} about={about} />
    </>
  );
};
