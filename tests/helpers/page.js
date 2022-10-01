const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');


class CustomPage{
  static async build (){
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property){
        return customPage[property] || browser[property] || page[property];

      }
    })
  }

  constructor(page){
    this.page = page;
  }

  async login(){
    const user = await userFactory();
    const {session, sig} = sessionFactory(user);

    await this.page.setCookie({name: 'session', value: session});
    await this.page.setCookie({name: 'session.sig', value: sig});
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitForSelector('a[href="/auth/logout"]');

  }

  getContentsOf(selector){
    return this.page.$eval(selector,el => el.innerHTML)
  }

  post(path, content){
    return this.page.evaluate((p, c)=> {
      return fetch(p, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(c)
      }).then(res => res.json())
    }, path, content)
    

  }

  get(path){
    return this.page.evaluate((p)=> {
      return fetch(p, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
    }, path)
    

  }

  executeActions(actions){
    return Promise.all(actions.map(({method, path, content}) => {
      return this[method](path, content)

    }))
    

  }
}

module.exports = CustomPage;