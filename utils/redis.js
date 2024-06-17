import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.checkalive = true;
    this.client = createClient();
    this.client.on('error', (err) => {
      this.checkalive = false;
      console.log(err);
    });
    this.client.on('connect', () => {
      this.checkalive = true;
    });
    this.getAsync = promisify(this.client.get).bind(this.client);
  }

  isAlive() {
    return this.checkalive;
  }

  async get(key) {
    const val = await this.getAsync(key);
    return val;
  }

  async set(key, val, duration) {
    await this.client.setex(key, duration, val);
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
