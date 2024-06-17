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
    Promise.all([db.nbUsers(), db.nbFiles()])
      .then(([usnum, filenum]) => {
        res.status(200).json({ users: usnum, files: filenum });
      });
  }
}

module.exports = AppController;
