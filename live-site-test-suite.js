const puppeteer = require('puppeteer');

async function runComprehensiveTests() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const tests = [
    // Test password access
    async () => {
      await page.goto('https://preview--note-clarify-organizer.lovable.app/');
      await page.type('input[type="password"]', 'abc123');
      await page.keyboard.press('Enter');
      await page.waitForNavigation();
      return 'Password access';
    },
    
    // Test task parsing
    async () => {
      await page.goto('https://preview--note-clarify-organizer.lovable.app/converter');
      const input = await page.$('textarea');
      await input.type('Meeting tomorrow at 2pm with Sarah about project');
      await page.click('button:has-text("Parse")');
      await page.waitForSelector('.task-item', { timeout: 5000 });
      return 'Task parsing';
    },
    
    // Test date extraction
    async () => {
      const taskText = await page.$eval('.task-item', el => el.textContent);
      if (taskText.includes('tomorrow')) return 'Date extraction';
      throw new Error('Date not extracted');
    },
    
    // Test Motion API connection
    async () => {
      const motionButton = await page.$('button:has-text("Motion")');
      if (motionButton) return 'Motion API ready';
      throw new Error('Motion not configured');
    }
  ];
  
  let passed = 0;
  for (const test of tests) {
    try {
      const name = await test();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  }
  
  await browser.close();
  console.log(`\nResults: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

runComprehensiveTests();
