// Diagnostic utility to check Amplify styles in the browser
export function diagnoseAmplifyStyles() {
  console.log('🔍 Diagnosing Amplify Theme Issues...\n');
  
  // Check if Amplify styles are loaded
  const stylesheets = Array.from(document.styleSheets);
  const amplifyStyles = stylesheets.filter(sheet => {
    try {
      return sheet.href?.includes('amplify') || 
             Array.from(sheet.cssRules || []).some(rule => 
               rule.cssText?.includes('amplify'));
    } catch (e) {
      return false;
    }
  });
  
  console.log(`✅ Found ${amplifyStyles.length} Amplify stylesheets`);
  
  // Check for CSS layer order
  const computedStyles = getComputedStyle(document.documentElement);
  console.log('\n📊 CSS Custom Properties:');
  const customProps = Array.from(document.documentElement.style)
    .filter(prop => prop.startsWith('--amplify'));
  
  if (customProps.length > 0) {
    customProps.forEach(prop => {
      console.log(`  ${prop}: ${computedStyles.getPropertyValue(prop)}`);
    });
  } else {
    console.log('  ⚠️ No Amplify CSS custom properties found');
  }
  
  // Check specific Amplify button styles
  const amplifyButtons = document.querySelectorAll('[class*="amplify-button"]');
  console.log(`\n🔘 Found ${amplifyButtons.length} Amplify buttons`);
  
  amplifyButtons.forEach((button, index) => {
    const styles = getComputedStyle(button);
    console.log(`\n  Button ${index + 1}:`);
    console.log(`    Background: ${styles.backgroundColor}`);
    console.log(`    Color: ${styles.color}`);
    console.log(`    Border Radius: ${styles.borderRadius}`);
    console.log(`    Classes: ${button.className}`);
  });
  
  // Check for style conflicts
  console.log('\n⚔️ Checking for potential conflicts:');
  
  // Check if Tailwind utilities are overriding
  const tailwindReset = Array.from(stylesheets).some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule => 
        rule.cssText?.includes('tailwind') || 
        rule.cssText?.includes('--tw-'));
    } catch (e) {
      return false;
    }
  });
  
  if (tailwindReset) {
    console.log('  ⚠️ Tailwind CSS detected - may override Amplify styles');
  }
  
  // Check CSS layer information
  try {
    const layers = Array.from(stylesheets).flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || [])
          .filter(rule => rule.type === CSSRule.LAYER_BLOCK_RULE)
          .map(rule => (rule as any).name);
      } catch (e) {
        return [];
      }
    });
    
    if (layers.length > 0) {
      console.log(`\n📚 CSS Layers found: ${layers.join(', ')}`);
    }
  } catch (e) {
    console.log('  ℹ️ Could not detect CSS layers');
  }
  
  // Provide recommendations
  console.log('\n💡 Recommendations:');
  console.log('1. Ensure @aws-amplify/ui-react/styles.css is imported');
  console.log('2. Import Amplify styles before Tailwind to prevent overrides');
  console.log('3. Use CSS layers carefully - Amplify styles should not be in a lower priority layer');
  console.log('4. Check ThemeProvider is wrapping your app at the root level');
  console.log('5. Verify theme tokens are using the correct v6 format');
  
  return {
    amplifyStylesheetsFound: amplifyStyles.length,
    amplifyButtonsFound: amplifyButtons.length,
    customPropertiesFound: customProps.length,
    hasTailwindConflict: tailwindReset
  };
}

// Auto-run if in development
if (import.meta.env.DEV) {
  (window as any).diagnoseAmplifyStyles = diagnoseAmplifyStyles;
  console.log('💡 Run diagnoseAmplifyStyles() in console to check Amplify theme issues');
}