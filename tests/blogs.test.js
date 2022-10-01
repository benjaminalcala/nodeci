const { Aggregate } = require('mongoose');
const Page = require('./helpers/page');

let page;


beforeEach(async() => {
  page  = await Page.build();
  await page.goto('http://localhost:3000');
})

afterEach(async() => {
  await page.close()
})

describe('When the user is logged in', async() => {
  beforeEach(async()=> {
    await page.login();
    await page.click('a.btn-floating')
  })

  test('they see a form', async() => {
    const label = await page.getContentsOf('div label');
    expect(label).toEqual('Blog Title')

  })

  describe('and they enter valid input', async() => {
    beforeEach(async()=> {
      await page.type('.title input', 'Title')
      await page.type('.content input', 'Content')
      await page.click('form button');

    })

    test('it goes to confirm page', async() => {
      const label = await page.getContentsOf('h5');
      expect(label).toEqual('Please confirm your entries');


    })

    test('it gets added to blog', async() => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('Title');
      expect(content).toEqual('Content');
      
    })

  })

  describe('and they enter invalid input', async() => {
    beforeEach(async()=> {
      await page.click('form button');
      
      
    })

    test('the form shows an error', async()=> {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');

    })

  })

})

describe('When the user is not logged in', async() => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      content: {
        title: 'T',
        content: 'C'
      }
    },
  ]

  test('Blog related actions are prohibited', async ()=> {
    const results = await page.executeActions(actions);

    for(let result of results){
      expect(result).toEqual({error: 'You must log in!'})
    }
  })


  
})