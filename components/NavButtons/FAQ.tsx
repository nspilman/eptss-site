import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navigation } from "@/enum/navigation";

export const FAQButton = () => (
  <Link href={Navigation.FAQ} passHref>
    <Button
      variant="outline"
      className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors"
    >
      FAQ
    </Button>
  </Link>
);