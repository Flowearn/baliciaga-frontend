import { Button, Card, Heading, Text, TextField, Flex } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import { diagnoseAmplifyStyles } from '@/utils/diagnoseAmplifyStyles';

export default function AmplifyThemeTest() {
  useEffect(() => {
    // Run diagnosis after component mounts
    setTimeout(() => {
      diagnoseAmplifyStyles();
    }, 100);
  }, []);
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <Heading level={1}>Amplify Theme Test Page</Heading>
        
        <Card variation="elevated">
          <Heading level={2}>Test Amplify Button Styles</Heading>
          <Text>If the theme is working correctly, these buttons should have custom styling:</Text>
          
          <Flex direction="column" gap="1rem" marginTop="1rem">
            <div>
              <Text as="p" fontWeight="bold">Primary Button (should be #B7AC93 color):</Text>
              <Button variation="primary">Primary Button</Button>
            </div>
            
            <div>
              <Text as="p" fontWeight="bold">Default Button:</Text>
              <Button>Default Button</Button>
            </div>
            
            <div>
              <Text as="p" fontWeight="bold">Link Button:</Text>
              <Button variation="link">Link Button</Button>
            </div>
          </Flex>
        </Card>
        
        <Card variation="outlined">
          <Heading level={3}>Test Form Fields</Heading>
          <TextField
            label="Email"
            placeholder="Enter your email"
            type="email"
          />
          <TextField
            label="Password"
            placeholder="Enter your password"
            type="password"
            marginTop="1rem"
          />
        </Card>
        
        <Card>
          <Heading level={3}>Regular HTML Button for Comparison</Heading>
          <button 
            style={{ 
              backgroundColor: 'red', 
              color: 'white', 
              padding: '10px 20px',
              borderRadius: '99px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            HTML Button (Red)
          </button>
        </Card>
      </div>
    </div>
  );
}