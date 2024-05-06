import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";

interface BottomNavProps {
  userId: string;
  about: { title: string; href: string; description: string }[];
}
export const BottomNav = ({
  userId,
  about,
}: BottomNavProps): React.ReactElement => {
  return (
    <div className="fixed bottom-0 left-0 w-full flex py-2 justify-center bg-slate-500/20 backdrop-blur z-10 box-shadow inset 0 -2px 4px rgba(0, 0, 0, 0.2)  sm:hidden">
      <div className="relative z-20 w-full flex justify-center ">
        <Drawer>
          <DrawerTrigger>
            <Button className="w-44">Menu</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Navigation Menu</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-2 items-center">
              <Button variant={"secondary"} className="w-2/3">
                <Link href="/">Home</Link>
              </Button>
              {about.map((about) => (
                <Button
                  key={about.title}
                  variant={"secondary"}
                  className="w-2/3"
                >
                  <Link href={about.href}>{about.title}</Link>
                </Button>
              ))}
              <Button variant={"secondary"} className="w-2/3">
                <Link href="/studio">Studio</Link>
              </Button>
              {userId === "" ? (
                <Button variant={"secondary"} className="w-2/3">
                  <Link href="/">Login</Link>
                </Button>
              ) : (
                <Button variant={"secondary"} className="w-2/3">
                  <Link href="/">Logout</Link>
                </Button>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline" className="w-4/5">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
