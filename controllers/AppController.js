const redis = require('../utils/redis');
const db = require('../utils/db');

class AppController {
  static getStatus(req, res) {
    const data = {
      redis: redis.isAlive(),
      db: db.isAlive(),
    };
    res.status(200).json(data);
  }

  static getStats(req, res) {
    const data = {
      users: db.nbUsers(),
      files: db.nbFiles(),
    };
    res.status(200).json(data);
  }
}

module.exports = AppController;
