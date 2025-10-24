"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@eptss/ui";
import { Navigation } from "@eptss/shared";

export function URLParamsHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams) {
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (success) {
        toast({
          title: "Success!",
          description: success,
          variant: "default",
        });
        router.replace(Navigation.Dashboard);
      }

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        router.replace(Navigation.Dashboard);
      }
    }
  }, [searchParams, toast, router]);

  return null;
}
