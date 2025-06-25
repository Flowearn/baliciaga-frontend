// FORENSIC INVESTIGATION SCRIPT FOR GLOBALHEADER STYLING ISSUES
// Run this script in browser console when on a listing detail page

console.clear();
console.log('%c=== GLOBALHEADER FORENSIC INVESTIGATION ===', 'color: blue; font-size: 16px; font-weight: bold');
console.log('Timestamp:', new Date().toISOString());
console.log('URL:', window.location.href);

const investigation = {
  timestamp: new Date().toISOString(),
  url: window.location.href,
  findings: {}
};

// Helper function to get CSS source info
function getCSSRuleInfo(element, property) {
  const rules = [];
  const sheets = [...document.styleSheets];
  
  try {
    sheets.forEach(sheet => {
      try {
        const cssRules = [...(sheet.cssRules || sheet.rules || [])];
        cssRules.forEach((rule, index) => {
          if (rule.selectorText && element.matches(rule.selectorText)) {
            if (rule.style[property]) {
              rules.push({
                selector: rule.selectorText,
                value: rule.style[property],
                source: sheet.href || 'inline',
                ruleIndex: index
              });
            }
          }
        });
      } catch (e) {
        // Handle cross-origin stylesheets
      }
    });
  } catch (e) {
    console.error('Error accessing stylesheets:', e);
  }
  
  return rules;
}

console.log('\n%c=== A. PRIMARY NAVIGATION CONTAINER ===', 'color: green; font-weight: bold');
console.log('Looking for the container with Baliciaga title and navigation buttons...');

// Find the GlobalHeader by looking for the nav element with specific structure
const navElements = document.querySelectorAll('nav');
let primaryNav = null;

navElements.forEach(nav => {
  const h1 = nav.querySelector('h1');
  if (h1 && h1.textContent.includes('Baliciaga')) {
    primaryNav = nav.closest('div[class*="relative"]');
  }
});

if (primaryNav) {
  const computedStyle = window.getComputedStyle(primaryNav);
  const bgColor = computedStyle.backgroundColor;
  
  console.log('✓ Found Primary Navigation Container');
  console.log('Element:', primaryNav);
  console.log('%cBackground Color: ' + bgColor, 'background: ' + bgColor + '; color: ' + (bgColor === 'rgba(0, 0, 0, 0)' ? 'black' : 'white') + '; padding: 2px 5px;');
  
  // Check inline styles
  if (primaryNav.style.backgroundColor) {
    console.log('Inline style backgroundColor:', primaryNav.style.backgroundColor);
  }
  
  // Get CSS rules
  const cssRules = getCSSRuleInfo(primaryNav, 'backgroundColor');
  if (cssRules.length > 0) {
    console.log('CSS Rules applying background-color:');
    cssRules.forEach(rule => {
      console.log(`  - Selector: ${rule.selector}`);
      console.log(`    Value: ${rule.value}`);
      console.log(`    Source: ${rule.source}`);
    });
  }
  
  investigation.findings.primaryNavigation = {
    backgroundColor: bgColor,
    inlineStyle: primaryNav.style.backgroundColor || 'none',
    cssRules: cssRules,
    element: primaryNav.outerHTML.substring(0, 300) + '...'
  };
} else {
  console.log('❌ Primary navigation container not found');
}

console.log('\n%c=== B. SECONDARY NAVIGATION CONTAINER (TopNavBar) ===', 'color: green; font-weight: bold');
console.log('Looking for the container with "My Listings"...');

// Find TopNavBar by looking for the element containing "My Listings"
const myListingsLinks = Array.from(document.querySelectorAll('a')).filter(a => 
  a.textContent.trim() === 'My Listings'
);

let topNavBar = null;
if (myListingsLinks.length > 0) {
  // Find the parent container of the navigation links
  topNavBar = myListingsLinks[0].closest('div[class*="py-0"]')?.parentElement;
}

if (topNavBar) {
  const computedStyle = window.getComputedStyle(topNavBar);
  const bgColor = computedStyle.backgroundColor;
  
  console.log('✓ Found Secondary Navigation Container (TopNavBar)');
  console.log('Element:', topNavBar);
  console.log('%cBackground Color: ' + bgColor, 'background: ' + bgColor + '; color: ' + (bgColor === 'rgba(0, 0, 0, 0)' ? 'black' : 'white') + '; padding: 2px 5px;');
  
  // Check inline styles
  if (topNavBar.style.backgroundColor) {
    console.log('Inline style backgroundColor:', topNavBar.style.backgroundColor);
  }
  
  // Get CSS rules
  const cssRules = getCSSRuleInfo(topNavBar, 'backgroundColor');
  if (cssRules.length > 0) {
    console.log('CSS Rules applying background-color:');
    cssRules.forEach(rule => {
      console.log(`  - Selector: ${rule.selector}`);
      console.log(`    Value: ${rule.value}`);
      console.log(`    Source: ${rule.source}`);
    });
  }
  
  investigation.findings.secondaryNavigation = {
    backgroundColor: bgColor,
    inlineStyle: topNavBar.style.backgroundColor || 'none',
    cssRules: cssRules,
    element: topNavBar.outerHTML.substring(0, 300) + '...'
  };
} else {
  console.log('❌ Secondary navigation container not found');
}

console.log('\n%c=== C. BALICIAGA TITLE (H1) ===', 'color: green; font-weight: bold');

const h1 = document.querySelector('h1');
if (h1) {
  const computedStyle = window.getComputedStyle(h1);
  const color = computedStyle.color;
  const bgColor = computedStyle.backgroundColor;
  
  console.log('✓ Found H1 Element');
  console.log('Element:', h1);
  console.log('%cText Color: ' + color, 'color: ' + color + '; font-weight: bold;');
  console.log('%cBackground Color: ' + bgColor, 'background: ' + bgColor + '; color: ' + (bgColor === 'rgba(0, 0, 0, 0)' ? 'black' : 'white') + '; padding: 2px 5px;');
  
  // Get CSS rules for color
  const colorRules = getCSSRuleInfo(h1, 'color');
  if (colorRules.length > 0) {
    console.log('CSS Rules applying color:');
    colorRules.forEach(rule => {
      console.log(`  - Selector: ${rule.selector}`);
      console.log(`    Value: ${rule.value}`);
      console.log(`    Source: ${rule.source}`);
    });
  }
  
  investigation.findings.baliciagaTitle = {
    color: color,
    backgroundColor: bgColor,
    cssRules: colorRules,
    element: h1.outerHTML
  };
} else {
  console.log('❌ H1 element not found');
}

console.log('\n%c=== D. ZUSTAND STATE CHECK ===', 'color: green; font-weight: bold');

const themeState = window.useThemeStore?.getState?.() || null;
if (themeState) {
  console.log('✓ Zustand store accessible');
  console.log('Active Theme:', themeState.activeTheme);
  if (themeState.activeTheme) {
    console.log('  - backgroundColor:', themeState.activeTheme.backgroundColor);
    console.log('  - foregroundColor:', themeState.activeTheme.foregroundColor);
  }
  investigation.findings.zustandState = themeState.activeTheme;
} else {
  console.log('❌ Store not accessible');
  investigation.findings.zustandState = 'Store not accessible';
}

console.log('\n%c=== ADDITIONAL DIAGNOSTICS ===', 'color: orange; font-weight: bold');

// Check for ColoredPageWrapper
const coloredWrapper = document.querySelector('div[style*="background-color"]');
if (coloredWrapper) {
  console.log('ColoredPageWrapper found:');
  console.log('  - Background:', window.getComputedStyle(coloredWrapper).backgroundColor);
  console.log('  - Inline style:', coloredWrapper.style.backgroundColor);
}

// Check body classes
console.log('Body classes:', document.body.className);

// Check for any immersive class elements
const immersiveElements = document.querySelectorAll('[class*="immersive"]');
console.log('Elements with "immersive" in class:', immersiveElements.length);

console.log('\n%c=== INVESTIGATION COMPLETE ===', 'color: blue; font-size: 16px; font-weight: bold');
console.log('Full investigation results:', investigation);

// Make investigation results available globally
window.forensicInvestigation = investigation;