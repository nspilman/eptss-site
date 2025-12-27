import React from 'react';
import { ThemeSection } from './ThemeSection';

import { Text } from "@eptss/ui";
export const ContainerQueriesSection = () => (
  <ThemeSection 
    title="Container Queries" 
    description="Container query variables are defined using --container-* variables."
  >
    <div className="container border border-border p-6 rounded-lg bg-muted">
      <div className="@sm:bg-red-500 @md:bg-green-500 @lg:bg-blue-500 @xl:bg-purple-500 p-4 mb-4 text-white rounded font-medium text-center">
        This element changes color based on container size
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
        <div className="p-2 bg-red-100 rounded text-red-800">
          <Text as="span" weight="medium" className="block">@sm</Text>
          <Text as="span" size="xs" color="primary">--container-sm</Text>
          <Text as="span" size="xs" color="muted">40rem</Text>
        </div>
        <div className="p-2 bg-green-100 rounded text-green-800">
          <Text as="span" weight="medium" className="block">@md</Text>
          <Text as="span" size="xs" color="primary">--container-md</Text>
          <Text as="span" size="xs" color="muted">48rem</Text>
        </div>
        <div className="p-2 bg-blue-100 rounded text-blue-800">
          <Text as="span" weight="medium" className="block">@lg</Text>
          <Text as="span" size="xs" color="primary">--container-lg</Text>
          <Text as="span" size="xs" color="muted">64rem</Text>
        </div>
        <div className="p-2 bg-purple-100 rounded text-purple-800">
          <Text as="span" weight="medium" className="block">@xl</Text>
          <Text as="span" size="xs" color="primary">--container-xl</Text>
          <Text as="span" size="xs" color="muted">80rem</Text>
        </div>
      </div>
    </div>
  </ThemeSection>
);
