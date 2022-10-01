const mongoose  = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');


const client = redis.createClient(keys.redisUrl);
const exec = mongoose.Query.prototype.exec;

client.hget = util.promisify(client.hget);


mongoose.Query.prototype.cache = function(options = {}){
  this.cacheQuery = true;
  this.key = JSON.stringify(options.key || '');
  return this;

}

mongoose.Query.prototype.exec = async function(){
  if(!this.cacheQuery){
    return exec.apply(this, arguments)
  }

  const collectionKey = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }))

  const cachedResult = await client.hget(this.key, collectionKey);

  if(cachedResult){
    console.log('FROM CACHE')
    const doc = JSON.parse(cachedResult);
    return Array.isArray(doc)
    ? doc.map(d => new this.model(d))
    : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  await client.hset(this.key, collectionKey, JSON.stringify(result));
  console.log('FROM MONGO')
  return result;

}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}