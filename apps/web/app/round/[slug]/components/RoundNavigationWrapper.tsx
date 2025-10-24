import React from "react";
import { RoundNavigation } from "./RoundNavigation";

interface RoundNavigationWrapperProps {
  navigation: {
    previousSlug?: string;
    nextSlug?: string;
  };
}

export const RoundNavigationWrapper = ({ navigation }: RoundNavigationWrapperProps) => (
  <RoundNavigation navigation={navigation} />
);
