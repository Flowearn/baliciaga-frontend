// Forensic investigation script for GlobalHeader styling issues
// This script should be run in the browser console when on a listing detail page

function investigateHeaderStyles() {
  const results = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    findings: {}
  };

  // A. Primary Navigation Container (containing "Baliciaga" title)
  console.log('\n=== A. PRIMARY NAVIGATION CONTAINER ===');
  const primaryNav = document.querySelector('nav');
  if (primaryNav) {
    const computed = window.getComputedStyle(primaryNav);
    results.findings.primaryNavigation = {
      backgroundColor: computed.backgroundColor,
      element: primaryNav.outerHTML.substring(0, 200) + '...'
    };
    console.log('Element:', primaryNav);
    console.log('Background Color:', computed.backgroundColor);
    console.log('Applied styles in DevTools Styles panel');
  } else {
    console.log('Primary navigation not found');
  }

  // B. Secondary Navigation Container (containing "My Listings")
  console.log('\n=== B. SECONDARY NAVIGATION CONTAINER ===');
  // Look for TopNavBar or element containing "My Listings"
  const myListingsElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent.includes('My Listings') && el.children.length < 10
  );
  
  if (myListingsElements.length > 0) {
    const topNavBar = myListingsElements[0].closest('[class*="nav"], [class*="Nav"], header > div');
    if (topNavBar) {
      const computed = window.getComputedStyle(topNavBar);
      results.findings.secondaryNavigation = {
        backgroundColor: computed.backgroundColor,
        element: topNavBar.outerHTML.substring(0, 200) + '...'
      };
      console.log('Element:', topNavBar);
      console.log('Background Color:', computed.backgroundColor);
      console.log('Applied styles in DevTools Styles panel');
    }
  } else {
    console.log('Secondary navigation not found');
  }

  // C. Baliciaga Title (<h1>)
  console.log('\n=== C. BALICIAGA TITLE (H1) ===');
  const h1 = document.querySelector('h1');
  if (h1) {
    const computed = window.getComputedStyle(h1);
    results.findings.baliciagaTitle = {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      element: h1.outerHTML
    };
    console.log('Element:', h1);
    console.log('Color:', computed.color);
    console.log('Background Color:', computed.backgroundColor);
    console.log('Applied styles in DevTools Styles panel');
  } else {
    console.log('H1 not found');
  }

  // D. Zustand State Check
  console.log('\n=== D. ZUSTAND STATE CHECK ===');
  const themeState = window.useThemeStore?.getState?.()?.activeTheme || 'Store not accessible';
  results.findings.zustandTheme = themeState;
  console.log('Active Theme:', themeState);

  // Additional helpful information
  console.log('\n=== ADDITIONAL INFO ===');
  
  // Check for immersive header class
  const immersiveHeaders = document.querySelectorAll('[class*="immersive"]');
  if (immersiveHeaders.length > 0) {
    console.log('Immersive header elements found:', immersiveHeaders);
    results.findings.immersiveHeaders = Array.from(immersiveHeaders).map(el => ({
      classes: el.className,
      backgroundColor: window.getComputedStyle(el).backgroundColor
    }));
  }

  // Check body classes
  console.log('Body classes:', document.body.className);
  results.findings.bodyClasses = document.body.className;

  return results;
}

// Run the investigation
investigateHeaderStyles();