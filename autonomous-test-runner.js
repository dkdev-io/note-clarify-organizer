/**
 * Autonomous Puppeteer Test Runner for Note Clarify Organizer
 * Runs comprehensive E2E tests with minimal human intervention
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class AutonomousTestRunner {
  constructor(config = {}) {
    this.siteUrl = config.siteUrl || 'http://localhost:5173';
    this.results = [];
    this.criticalFailures = 0;
    this.totalTests = 0;
    this.passedTests = 0;
    this.screenshotDir = './test-screenshots';
    this.testData = this.generateTestData();
  }

  generateTestData() {
    return {
      testUser: {
        email: `test_${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Test User'
      },
      testNotes: [
        'Complete project report by Friday',
        'Meeting with Dan next Thursday at 2pm',
        'Sarah will review the design before Saturday',
        'Launch product on August 22nd',
        'Fix bugs in 2 weeks',
        'Prepare presentation by end of month',
        'John should complete testing tomorrow',
        'Review code within 24 hours',
        'Deploy to production this Monday',
        'Finish documentation by next week'
      ],
      multiLineNote: `Project Tasks:
Meeting tomorrow at 10am
Dan will prepare slides
Sarah reviews by Friday
Launch next Monday`,
      complexNote: `Here are the tasks for our website project:
- Dan will finish the homepage before Saturday
- Sarah needs to review the design by end of week  
- John should complete testing by the 23rd
- Meeting scheduled for next Thursday at 2pm
- Deploy to production in 2 weeks`
    };
  }

  async initialize() {
    // Create screenshot directory
    await fs.mkdir(this.screenshotDir, { recursive: true });
    
    // Create test report file
    this.reportFile = path.join(this.screenshotDir, `test-report-${Date.now()}.json`);
  }

  async runAllTests() {
    console.log('🚀 Starting Autonomous Test Runner...');
    await this.initialize();
    
    const browser = await puppeteer.launch({
      headless: process.env.CI === 'true', // Headless in CI, headed locally
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });

    try {
      // Phase 1: Authentication Tests
      await this.runAuthenticationTests(browser);
      
      // Phase 2: Note Parsing Tests
      await this.runNoteParsingTests(browser);
      
      // Phase 3: Motion API Tests
      await this.runMotionApiTests(browser);
      
      // Phase 4: Error Handling Tests
      await this.runErrorHandlingTests(browser);
      
      // Phase 5: Performance Tests
      await this.runPerformanceTests(browser);
      
    } catch (error) {
      console.error('❌ Fatal error in test execution:', error);
    } finally {
      await browser.close();
      await this.generateReport();
    }
    
    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.totalTests - this.passedTests,
      criticalFailures: this.criticalFailures,
      success: this.criticalFailures === 0
    };
  }

  async runAuthenticationTests(browser) {
    console.log('\n📝 Running Authentication Tests...');
    
    // Test 1: Register New User
    await this.runTest(browser, {
      name: 'Register new user',
      critical: true,
      test: async (page) => {
        await page.goto(this.siteUrl);
        await page.waitForSelector('#register-link, #auth-button', { timeout: 5000 });
        await page.click('#register-link, #auth-button');
        
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', this.testData.testUser.email);
        await page.type('input[type="password"]', this.testData.testUser.password);
        
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Verify registration success
        const userElement = await page.$('.user-name, .user-email');
        return userElement !== null;
      }
    });
    
    // Test 2: Login Existing User
    await this.runTest(browser, {
      name: 'Login existing user',
      critical: true,
      test: async (page) => {
        await page.goto(this.siteUrl);
        await page.waitForSelector('#login-link, #auth-button');
        await page.click('#login-link, #auth-button');
        
        await page.type('input[type="email"]', this.testData.testUser.email);
        await page.type('input[type="password"]', this.testData.testUser.password);
        
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        return await page.$('.dashboard, .main-app') !== null;
      }
    });
  }

  async runNoteParsingTests(browser) {
    console.log('\n📝 Running Note Parsing Tests...');
    
    // Test each note pattern
    for (const note of this.testData.testNotes) {
      await this.runTest(browser, {
        name: `Parse: "${note.substring(0, 30)}..."`,
        critical: false,
        test: async (page) => {
          await page.goto(`${this.siteUrl}/converter`);
          
          // Input note
          const textarea = await page.$('textarea, #note-input');
          await textarea.click({ clickCount: 3 }); // Select all
          await page.keyboard.press('Backspace');
          await textarea.type(note);
          
          // Parse
          await page.click('button:has-text("Parse"), #parse-button');
          await page.waitForSelector('.task-item, .task-card', { timeout: 5000 });
          
          // Verify task was created
          const tasks = await page.$$('.task-item, .task-card');
          return tasks.length > 0;
        }
      });
    }
    
    // Test multi-line note
    await this.runTest(browser, {
      name: 'Parse multi-line note',
      critical: true,
      test: async (page) => {
        await page.goto(`${this.siteUrl}/converter`);
        
        const textarea = await page.$('textarea, #note-input');
        await textarea.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');
        await textarea.type(this.testData.multiLineNote);
        
        await page.click('button:has-text("Parse"), #parse-button');
        await page.waitForSelector('.task-item, .task-card');
        
        const tasks = await page.$$('.task-item, .task-card');
        return tasks.length >= 4; // Should create 4 tasks
      }
    });
  }

  async runMotionApiTests(browser) {
    console.log('\n🔗 Running Motion API Tests...');
    
    // Test Motion Connection
    await this.runTest(browser, {
      name: 'Connect to Motion API',
      critical: true,
      test: async (page) => {
        await page.goto(`${this.siteUrl}/converter`);
        
        // Open Motion connection dialog
        await page.click('button:has-text("Connect"), .motion-connect');
        await page.waitForSelector('.api-key-input, input[placeholder*="API"]');
        
        // Enter test API key (or proxy mode)
        await page.type('.api-key-input, input[placeholder*="API"]', 'proxy_mode');
        await page.click('button:has-text("Connect"), button:has-text("Save")');
        
        // Check for success message or workspace selector
        await page.waitForSelector('.workspace-select, .success-message', { timeout: 5000 });
        return true;
      }
    });
    
    // Test Task Creation
    await this.runTest(browser, {
      name: 'Create task in Motion',
      critical: true,
      test: async (page) => {
        await page.goto(`${this.siteUrl}/converter`);
        
        // Parse a simple task
        const textarea = await page.$('textarea, #note-input');
        await textarea.type('Test task for Motion API');
        await page.click('button:has-text("Parse"), #parse-button');
        
        await page.waitForSelector('.task-item, .task-card');
        
        // Send to Motion
        await page.click('button:has-text("Send"), button:has-text("Motion"), .send-to-motion');
        
        // Wait for success message
        const success = await page.waitForSelector('.success-message, .toast-success', { 
          timeout: 10000 
        }).catch(() => null);
        
        return success !== null;
      }
    });
  }

  async runErrorHandlingTests(browser) {
    console.log('\n⚠️ Running Error Handling Tests...');
    
    // Test Invalid Input
    await this.runTest(browser, {
      name: 'Handle empty input',
      critical: false,
      test: async (page) => {
        await page.goto(`${this.siteUrl}/converter`);
        
        // Try to parse empty input
        await page.click('button:has-text("Parse"), #parse-button');
        
        // Should show error or do nothing
        const error = await page.$('.error-message, .toast-error');
        const tasks = await page.$$('.task-item, .task-card');
        
        return error !== null || tasks.length === 0;
      }
    });
    
    // Test API Error
    await this.runTest(browser, {
      name: 'Handle Motion API error',
      critical: true,
      test: async (page) => {
        await page.goto(`${this.siteUrl}/converter`);
        
        // Disconnect Motion or use invalid key
        await page.evaluate(() => {
          localStorage.removeItem('motion_api_key');
        });
        
        // Try to send task
        const textarea = await page.$('textarea, #note-input');
        await textarea.type('Test task');
        await page.click('button:has-text("Parse"), #parse-button');
        await page.waitForSelector('.task-item, .task-card');
        
        await page.click('button:has-text("Send"), button:has-text("Motion"), .send-to-motion');
        
        // Should show error message
        const error = await page.waitForSelector('.error-message, .toast-error, .api-error', {
          timeout: 5000
        }).catch(() => null);
        
        return error !== null;
      }
    });
  }

  async runPerformanceTests(browser) {
    console.log('\n⚡ Running Performance Tests...');
    
    // Test Page Load Time
    await this.runTest(browser, {
      name: 'Page load time < 3s',
      critical: false,
      test: async (page) => {
        const startTime = Date.now();
        await page.goto(this.siteUrl, { waitUntil: 'networkidle0' });
        const loadTime = Date.now() - startTime;
        
        console.log(`  Page loaded in ${loadTime}ms`);
        return loadTime < 3000;
      }
    });
    
    // Test Batch Processing
    await this.runTest(browser, {
      name: 'Process 10 tasks batch',
      critical: false,
      test: async (page) => {
        await page.goto(`${this.siteUrl}/converter`);
        
        // Create batch input
        const batchNotes = Array.from({ length: 10 }, (_, i) => 
          `Task ${i + 1}: Complete item ${i + 1} by tomorrow`
        ).join('\n');
        
        const textarea = await page.$('textarea, #note-input');
        await textarea.type(batchNotes);
        
        const startTime = Date.now();
        await page.click('button:has-text("Parse"), #parse-button');
        await page.waitForSelector('.task-item, .task-card');
        const processTime = Date.now() - startTime;
        
        const tasks = await page.$$('.task-item, .task-card');
        console.log(`  Processed ${tasks.length} tasks in ${processTime}ms`);
        
        return tasks.length >= 10 && processTime < 5000;
      }
    });
  }

  async runTest(browser, testConfig) {
    this.totalTests++;
    const { name, critical, test } = testConfig;
    
    console.log(`  Running: ${name}`);
    const page = await browser.newPage();
    
    try {
      const passed = await test(page);
      
      if (passed) {
        this.passedTests++;
        console.log(`    ✅ PASSED`);
        this.results.push({ name, status: 'passed', critical });
      } else {
        throw new Error('Test assertion failed');
      }
    } catch (error) {
      console.log(`    ❌ FAILED: ${error.message}`);
      
      if (critical) {
        this.criticalFailures++;
      }
      
      // Take screenshot on failure
      const screenshotPath = path.join(
        this.screenshotDir, 
        `${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      this.results.push({
        name,
        status: 'failed',
        critical,
        error: error.message,
        screenshot: screenshotPath
      });
    } finally {
      await page.close();
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.totalTests - this.passedTests,
        criticalFailures: this.criticalFailures,
        passRate: `${Math.round((this.passedTests / this.totalTests) * 100)}%`
      },
      results: this.results,
      recommendation: this.criticalFailures === 0 
        ? '✅ Ready for production'
        : '⚠️ Critical issues must be fixed'
    };
    
    // Save report
    await fs.writeFile(this.reportFile, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} (${report.summary.passRate})`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Critical Failures: ${report.summary.criticalFailures}`);
    console.log('\nRecommendation:', report.recommendation);
    console.log(`\nFull report saved to: ${this.reportFile}`);
    
    return report;
  }
}

// Auto-execute if run directly
if (require.main === module) {
  const runner = new AutonomousTestRunner({
    siteUrl: process.env.SITE_URL || 'http://localhost:5173'
  });
  
  runner.runAllTests().then(results => {
    process.exit(results.criticalFailures > 0 ? 1 : 0);
  });
}

module.exports = AutonomousTestRunner;