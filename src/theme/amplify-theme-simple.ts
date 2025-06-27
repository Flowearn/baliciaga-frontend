import { Theme } from '@aws-amplify/ui-react';

// Simplified theme for testing
export const baliciagaAmplifyThemeSimple: Theme = {
  name: 'baliciaga-simple',
  tokens: {
    components: {
      button: {
        // Override all button variations
        backgroundColor: { value: '#B7AC93' },
        color: { value: '#FFFFFF' },
        borderRadius: { value: '99px' },
        _hover: {
          backgroundColor: { value: '#9e9480' },
        },
      },
    },
  },
};