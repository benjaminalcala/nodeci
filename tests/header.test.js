const Page = require('../tests/helpers/page');

let page;

beforeEach(async ()=>{
  
  page = await Page.build();
  await page.goto('http://localhost:3000')

})


afterEach(async ()=>{
  await page.close()
  
})


test('App name is displayed on header', async () => {
  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual('Blogster')
})

test('Navigates to google auth page when sign in is clicked', async () => {

  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);

})

test('Displays sign out button after user authenticates', async () => {
 
  await page.login();


  const text = await page.getContentsOf('a[href="/auth/logout"]');

  expect(text).toEqual('Logout');


  
})