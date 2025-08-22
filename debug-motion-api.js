const { chromium } = require('playwright');

async function debugMotionAPI() {
    const browser = await chromium.launch({ 
        headless: false, // Keep visible to see what's happening
        devtools: true   // Open devtools automatically
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    // Store captured data
    const capturedData = {
        consoleLogs: [],
        networkRequests: [],
        motionApiCalls: []
    };

    // Capture console logs
    page.on('console', msg => {
        const logText = msg.text();
        console.log(`🖥️  CONSOLE: ${logText}`);
        capturedData.consoleLogs.push({
            type: msg.type(),
            text: logText,
            timestamp: new Date().toISOString()
        });
    });

    // Capture network requests
    page.on('request', request => {
        const url = request.url();
        if (url.includes('api.usemotion.com') || url.includes('/v1/tasks')) {
            console.log(`📡 REQUEST: ${request.method()} ${url}`);
            capturedData.networkRequests.push({
                method: request.method(),
                url: url,
                headers: request.headers(),
                postData: request.postData(),
                timestamp: new Date().toISOString()
            });
        }
    });

    // Capture network responses
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api.usemotion.com') || url.includes('/v1/tasks')) {
            console.log(`📥 RESPONSE: ${response.status()} ${url}`);
            
            let responseBody = null;
            try {
                responseBody = await response.text();
            } catch (e) {
                console.log('Could not read response body:', e.message);
            }

            const apiCall = {
                url: url,
                status: response.status(),
                statusText: response.statusText(),
                headers: response.headers(),
                body: responseBody,
                timestamp: new Date().toISOString()
            };
            
            capturedData.motionApiCalls.push(apiCall);
            
            console.log(`📊 Motion API Response:`, JSON.stringify(apiCall, null, 2));
        }
    });

    try {
        console.log('🚀 Starting Motion API debugging...');
        
        // Step 1: Navigate to localhost:8082
        console.log('📍 Step 1: Navigating to http://localhost:8082/');
        await page.goto('http://localhost:8082/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Step 2: Connect with dummy API key
        console.log('🔑 Step 2: Entering API key');
        const apiKeyInput = await page.waitForSelector('input[type="text"], input[type="password"], input[placeholder*="API"], input[placeholder*="key"]', { timeout: 10000 });
        await apiKeyInput.fill('test_key_123');
        
        // Look for connect/submit button
        const connectButton = await page.locator('button:has-text("Connect"), button:has-text("Submit"), button[type="submit"]').first();
        if (await connectButton.isVisible()) {
            await connectButton.click();
            console.log('✅ Clicked connect button');
            await page.waitForTimeout(3000);
        }

        // Step 3: Skip workspace/project selection
        console.log('⏭️  Step 3: Looking for skip options');
        const skipButtons = await page.locator('button:has-text("Skip"), a:has-text("Skip"), button:has-text("Continue"), button:has-text("Next")').all();
        
        for (const button of skipButtons) {
            if (await button.isVisible()) {
                await button.click();
                console.log('✅ Clicked skip/continue button');
                await page.waitForTimeout(2000);
                break;
            }
        }

        // Step 4: Enter the task text
        console.log('✍️  Step 4: Entering task text');
        await page.waitForTimeout(2000);
        
        // Look for text input areas
        const textInputSelectors = [
            'textarea',
            'input[type="text"]',
            '[contenteditable="true"]',
            'input[placeholder*="task"]',
            'input[placeholder*="note"]',
            'textarea[placeholder*="task"]',
            'textarea[placeholder*="note"]'
        ];

        let textInput = null;
        for (const selector of textInputSelectors) {
            try {
                textInput = await page.waitForSelector(selector, { timeout: 2000 });
                if (textInput && await textInput.isVisible()) {
                    console.log(`📝 Found text input with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }

        if (textInput) {
            await textInput.fill('dan will finish his project by August 234rd');
            console.log('✅ Entered task text');
        } else {
            console.log('❌ Could not find text input field');
        }

        // Step 5: Go through task creation flow
        console.log('🔄 Step 5: Going through task creation flow');
        await page.waitForTimeout(2000);

        // Look for create/submit/add buttons
        const createButtons = await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Submit"), button:has-text("Save"), button[type="submit"]').all();
        
        for (const button of createButtons) {
            if (await button.isVisible()) {
                console.log('🎯 Found create button, clicking...');
                
                // Start monitoring for the specific logs we're looking for
                const logPromise = new Promise((resolve) => {
                    let timeout = setTimeout(() => resolve(null), 10000); // 10 second timeout
                    
                    const checkLogs = () => {
                        const relevantLogs = capturedData.consoleLogs.filter(log => 
                            log.text.includes('Full request body:') || 
                            log.text.includes('Response status: 400') || 
                            log.text.includes('❌ Error creating task:')
                        );
                        
                        if (relevantLogs.length > 0) {
                            clearTimeout(timeout);
                            resolve(relevantLogs);
                        } else {
                            setTimeout(checkLogs, 500);
                        }
                    };
                    
                    checkLogs();
                });
                
                await button.click();
                console.log('✅ Clicked create button');
                
                // Wait for logs or API calls
                const logs = await logPromise;
                if (logs) {
                    console.log('🎯 Captured relevant logs!');
                    logs.forEach(log => console.log(`📋 ${log.text}`));
                }
                
                await page.waitForTimeout(5000); // Wait for API call to complete
                break;
            }
        }

        // Step 6-8: Monitor and report findings
        console.log('\n📊 DEBUGGING RESULTS:');
        console.log('='.repeat(50));
        
        console.log('\n🖥️  CONSOLE LOGS:');
        capturedData.consoleLogs.forEach((log, i) => {
            if (log.text.includes('Full request body:') || 
                log.text.includes('Response status:') || 
                log.text.includes('Error creating task:') ||
                log.text.includes('request') ||
                log.text.includes('response') ||
                log.text.includes('error')) {
                console.log(`${i + 1}. [${log.type.toUpperCase()}] ${log.text}`);
            }
        });

        console.log('\n📡 NETWORK REQUESTS TO MOTION API:');
        capturedData.networkRequests.forEach((req, i) => {
            console.log(`${i + 1}. ${req.method} ${req.url}`);
            if (req.postData) {
                console.log(`   📤 Request Body: ${req.postData}`);
            }
            console.log(`   📋 Headers:`, JSON.stringify(req.headers, null, 2));
        });

        console.log('\n📥 MOTION API RESPONSES:');
        capturedData.motionApiCalls.forEach((call, i) => {
            console.log(`${i + 1}. ${call.status} ${call.statusText} - ${call.url}`);
            console.log(`   📤 Response Body: ${call.body}`);
            console.log(`   📋 Response Headers:`, JSON.stringify(call.headers, null, 2));
        });

        // Save detailed report to file
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalConsoleLogs: capturedData.consoleLogs.length,
                totalNetworkRequests: capturedData.networkRequests.length,
                totalMotionApiCalls: capturedData.motionApiCalls.length
            },
            consoleLogs: capturedData.consoleLogs,
            networkRequests: capturedData.networkRequests,
            motionApiCalls: capturedData.motionApiCalls
        };

        console.log('\n💾 Saving detailed report...');
        require('fs').writeFileSync('./motion-api-debug-report.json', JSON.stringify(report, null, 2));
        console.log('✅ Report saved to motion-api-debug-report.json');

    } catch (error) {
        console.error('❌ Error during debugging:', error);
    }

    console.log('\n⏸️  Pausing for manual inspection. Press any key to close browser...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
        browser.close();
        process.exit(0);
    });
}

// Run the debug session
debugMotionAPI().catch(console.error);