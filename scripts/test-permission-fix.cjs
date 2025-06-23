const { chromium } = require('playwright');

async function testPermissionFix() {
    console.log('🚀 Starting permission fix test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    let page;
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        page = await context.newPage();

        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error('❌ Browser console error:', msg.text());
            }
        });

        // Monitor network responses for 403 errors
        page.on('response', response => {
            if (response.status() === 403) {
                console.error(`❌ 403 Forbidden: ${response.url()}`);
            }
        });

        // 1. Navigate to the listing detail page
        console.log('📍 Step 1: Navigating to listing detail page...');
        await page.goto('http://localhost:8083/listings/53c347aa-20f0-437f-b412-0e7b68d0dedd');
        await page.waitForLoadState('networkidle');

        // Check if we're already on login page or need to login
        const isLoginPage = page.url().includes('/login');
        const needsLogin = isLoginPage || await page.$('text=Sign in');
        
        if (needsLogin) {
            console.log('📍 Need to login first...');
            
            // If not on login page, navigate to it
            if (!isLoginPage) {
                await page.goto('http://localhost:8083/login');
                await page.waitForLoadState('networkidle');
            }

            // 2. Login with provided credentials
            console.log('📍 Step 2: Logging in...');
            await page.fill('input[type="email"]', 'Troyzhy@gmail.com');
            await page.fill('input[type="password"]', 'Zhehkd.12351');
            
            // Click sign in button
            const signInButton = await page.$('button:has-text("Sign in")');
            await signInButton.click();
            
            // Wait for login to complete
            console.log('⏳ Waiting for login to complete...');
            try {
                await page.waitForURL('**/listings/**', { timeout: 15000 });
                console.log('✅ Login successful!');
            } catch (e) {
                // If URL doesn't change, check if we're logged in by looking for user-specific elements
                await page.waitForTimeout(3000);
                const isLoggedIn = await page.$('text=My Listing');
                if (isLoggedIn) {
                    console.log('✅ Login successful!');
                    // Navigate back to the listing
                    await page.goto('http://localhost:8083/listings/53c347aa-20f0-437f-b412-0e7b68d0dedd');
                    await page.waitForLoadState('networkidle');
                } else {
                    throw new Error('Login failed');
                }
            }
        }

        // 3. Check for action buttons on the listing page
        console.log('📍 Step 3: Looking for action buttons...');
        await page.waitForTimeout(2000); // Give page time to load user-specific content

        // Take screenshot of the page after login
        await page.screenshot({ 
            path: 'listing-page-after-login.png',
            fullPage: true 
        });

        // Look for Cancel button
        const cancelButton = await page.$('button:has-text("Cancel")');
        if (cancelButton) {
            console.log('✅ Found Cancel button!');
            
            // Test Cancel functionality
            console.log('📍 Testing Cancel functionality...');
            
            // Click Cancel button
            await cancelButton.click();
            
            // Handle confirmation dialog if it appears
            try {
                await page.waitForSelector('text=/Are you sure/', { timeout: 3000 });
                console.log('📍 Confirmation dialog appeared');
                
                // Click confirm
                const confirmButton = await page.getByRole('button', { name: /Yes.*cancel/i });
                await confirmButton.click();
                
                // Wait for operation to complete
                await page.waitForTimeout(3000);
                
                // Check for success or error
                const successToast = await page.$('text=/successfully cancelled/i');
                const errorAlert = await page.$('[role="alert"]');
                
                if (successToast) {
                    console.log('✅ Cancel operation successful!');
                } else if (errorAlert) {
                    const errorText = await errorAlert.textContent();
                    console.error('❌ Error during cancel:', errorText);
                    if (errorText.includes('403') || errorText.includes('Forbidden')) {
                        throw new Error('Permission denied for cancel operation');
                    }
                } else {
                    console.log('⚠️ No clear success/error message after cancel');
                }
                
            } catch (e) {
                console.log('⚠️ No confirmation dialog or operation failed');
            }
            
            // Take screenshot after cancel attempt
            await page.screenshot({ 
                path: 'after-cancel-attempt.png',
                fullPage: true 
            });
        } else {
            console.log('⚠️ No Cancel button found on this listing');
        }

        // Navigate to My Listings to test more operations
        console.log('📍 Step 4: Navigating to My Listings...');
        // Click My Listing button
        const myListingButton = await page.$('text=My Listing');
        if (myListingButton) {
            await myListingButton.click();
            await page.waitForLoadState('networkidle');
        } else {
            // Fallback to direct navigation
            await page.goto('http://localhost:8083/my-listings');
            await page.waitForLoadState('networkidle');
        }

        // Take screenshot of My Listings page
        await page.screenshot({ 
            path: 'my-listings-page.png',
            fullPage: true 
        });

        // Look for listings with Finalize buttons
        const finalizeButtons = await page.$$('button:has-text("Finalize")');
        if (finalizeButtons.length > 0) {
            console.log(`✅ Found ${finalizeButtons.length} Finalize button(s)`);
            
            // Test first Finalize button
            console.log('📍 Testing Finalize functionality...');
            await finalizeButtons[0].click();
            
            // Handle confirmation dialog
            try {
                await page.waitForSelector('text=/Are you sure/', { timeout: 3000 });
                console.log('📍 Confirmation dialog appeared');
                
                // Click confirm
                const confirmButton = await page.getByRole('button', { name: /Yes.*finalize/i });
                await confirmButton.click();
                
                // Wait for operation to complete
                await page.waitForTimeout(3000);
                
                // Check for success or error
                const successToast = await page.$('text=/successfully finalized/i');
                const errorAlert = await page.$('[role="alert"]');
                
                if (successToast) {
                    console.log('✅ Finalize operation successful!');
                } else if (errorAlert) {
                    const errorText = await errorAlert.textContent();
                    console.error('❌ Error during finalize:', errorText);
                    if (errorText.includes('403') || errorText.includes('Forbidden')) {
                        throw new Error('Permission denied for finalize operation');
                    }
                } else {
                    console.log('⚠️ No clear success/error message after finalize');
                }
                
            } catch (e) {
                console.log('⚠️ No confirmation dialog or operation failed');
            }
            
            // Take screenshot after finalize attempt
            await page.screenshot({ 
                path: 'after-finalize-attempt.png',
                fullPage: true 
            });
        } else {
            console.log('⚠️ No Finalize buttons found in My Listings');
        }

        // Look for Cancel buttons in My Listings
        const myListingsCancelButtons = await page.$$('button:has-text("Cancel"):visible');
        if (myListingsCancelButtons.length > 0) {
            console.log(`✅ Found ${myListingsCancelButtons.length} Cancel button(s) in My Listings`);
            
            // Test first available Cancel button
            console.log('📍 Testing Cancel functionality from My Listings...');
            await myListingsCancelButtons[0].click();
            
            // Handle confirmation dialog
            try {
                await page.waitForSelector('text=/Are you sure/', { timeout: 3000 });
                console.log('📍 Confirmation dialog appeared');
                
                // Click confirm
                const confirmButton = await page.getByRole('button', { name: /Yes.*cancel/i });
                await confirmButton.click();
                
                // Wait for operation to complete
                await page.waitForTimeout(3000);
                
                // Check for success or error
                const successToast = await page.$('text=/successfully cancelled/i');
                const errorAlert = await page.$('[role="alert"]');
                
                if (successToast) {
                    console.log('✅ Cancel operation successful from My Listings!');
                } else if (errorAlert) {
                    const errorText = await errorAlert.textContent();
                    console.error('❌ Error during cancel:', errorText);
                    if (errorText.includes('403') || errorText.includes('Forbidden')) {
                        throw new Error('Permission denied for cancel operation');
                    }
                } else {
                    console.log('⚠️ No clear success/error message after cancel');
                }
                
            } catch (e) {
                console.log('⚠️ No confirmation dialog or operation failed');
            }
            
            // Take final screenshot
            await page.screenshot({ 
                path: 'final-state.png',
                fullPage: true 
            });
        }

        console.log('🎉 Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Take error screenshot if page exists
        if (page) {
            await page.screenshot({ 
                path: 'test-error.png',
                fullPage: true 
            });
        }
        
        throw error;
    } finally {
        console.log('🔚 Closing browser...');
        await browser.close();
    }
}

// Run the test
testPermissionFix()
    .then(() => {
        console.log('✅ Test suite completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });