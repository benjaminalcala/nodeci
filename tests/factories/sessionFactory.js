const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip(['123123123']);



module.exports = user => {
  const sessionObject = {
    passport: {
      user: user._id.toString()
    }
  }


  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  const sig  = keygrip.sign('session=' + session);
  console.log(session, sig)

  return {session, sig};
}