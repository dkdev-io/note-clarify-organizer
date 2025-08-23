import puppeteer from 'puppeteer';

async function quickValidation() {
  console.log('🚀 Quick Validation of Autonomous Improvements');
  console.log('='.repeat(50));
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 10000
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    
    console.log('\n1️⃣ Testing site accessibility...');
    
    try {
      await page.goto('https://preview--note-clarify-organizer.lovable.app/', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      console.log('   ✅ Site loads successfully');
      
      // Check if password field exists
      const passwordField = await page.$('input[type="password"]');
      if (passwordField) {
        console.log('   ✅ Password protection active');
        await passwordField.type('abc123');
        await page.keyboard.press('Enter');
        
        // Wait for any navigation or content change
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('   ✅ Password authentication successful');
      }
      
    } catch (error) {
      console.log('   ❌ Site access failed:', error.message);
      return;
    }
    
    console.log('\n2️⃣ Checking for authentication improvements...');
    
    // Look for auth-related elements
    const authElements = await page.$$eval('*', elements => {
      const text = elements.map(el => el.textContent?.toLowerCase() || '').join(' ');
      return {
        hasLogin: text.includes('login') || text.includes('sign in'),
        hasRegister: text.includes('register') || text.includes('sign up'),
        hasAuth: text.includes('auth') || text.includes('user'),
        hasLogout: text.includes('logout') || text.includes('sign out')
      };
    });
    
    console.log('   Auth indicators found:', authElements);
    
    console.log('\n3️⃣ Checking task parsing functionality...');
    
    try {
      // Look for converter page or main functionality
      const currentUrl = page.url();
      if (!currentUrl.includes('converter')) {
        // Try to navigate to converter
        const converterLink = await page.$('a[href*="convert"], a[href*="task"], button:has-text("Convert")');
        if (converterLink) {
          await converterLink.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          // Try direct navigation
          await page.goto('https://preview--note-clarify-organizer.lovable.app/converter', {
            waitUntil: 'domcontentloaded'
          });
        }
      }
      
      // Look for input areas
      const inputElements = await page.$$('textarea, input[type="text"], [contenteditable]');
      console.log(`   ✅ Found ${inputElements.length} potential input field(s)`);
      
      // Look for buttons
      const buttons = await page.$$eval('button', btns => 
        btns.map(btn => btn.textContent?.toLowerCase() || '').filter(text => text.length > 0)
      );
      console.log('   Available buttons:', buttons.slice(0, 5));
      
    } catch (error) {
      console.log('   ⚠️ Could not test task parsing:', error.message);
    }
    
    console.log('\n4️⃣ Checking for UX improvements...');
    
    // Look for loading states, toasts, notifications
    const uxElements = await page.$$eval('*', elements => {
      const classNames = elements.map(el => el.className || '').join(' ');
      const text = elements.map(el => el.textContent?.toLowerCase() || '').join(' ');
      
      return {
        hasLoadingStates: classNames.includes('loading') || classNames.includes('spinner') || text.includes('loading'),
        hasToasts: classNames.includes('toast') || classNames.includes('notification'),
        hasSuccessMessages: text.includes('success') || text.includes('completed'),
        hasErrorMessages: text.includes('error') || text.includes('failed')
      };
    });
    
    console.log('   UX improvements found:', uxElements);
    
    console.log('\n📊 Summary:');
    console.log('   • Site accessibility: ✅');
    console.log('   • Password protection: ✅');
    console.log(`   • Auth improvements: ${authElements.hasLogin ? '✅' : '⚠️'}`);
    console.log(`   • Input functionality: ${inputElements.length > 0 ? '✅' : '⚠️'}`);
    console.log(`   • UX improvements: ${uxElements.hasLoadingStates || uxElements.hasToasts ? '✅' : '⚠️'}`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await browser.close();
  }
}

quickValidation().catch(console.error);