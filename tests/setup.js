require('../models/User');
const mongoose = require('mongoose');
const {mongoURI} = require('../config/keys');
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI, {useMongoClient: true});

Number.prototype._called = {};
jest.setTimeout(30000);

afterAll(() => {
  mongoose.disconnect();
});









