import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// Apply the dark theme to the Storybook UI
addons.setConfig({
  theme: {
    ...themes.dark,
    brandTitle: 'EPTSS Theme',
    brandUrl: 'https://eptss.xyz',
    brandTarget: '_self',
    colorPrimary: '#e2e240', // Accent Primary
    colorSecondary: '#0a0a14', // Primary
    appBg: '#0a0a14', // Primary
    appContentBg: '#0a0a14', // Primary
    appBorderColor: '#374151', // Gray 700
    textColor: '#ffffff', // White
    barTextColor: '#d1d5db', // Gray 300
    barSelectedColor: '#e2e240', // Accent Primary
    barBg: '#111827', // Gray 900
  },
});
