const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const db = require('../utils/db');
const redis = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const em = await (await db.usersCollection()).findOne({ email });
    if (em) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const hashed = sha1(password);
    const userId = await (await db.usersCollection()).insertOne({ email, password: hashed });
    res.status(201).json({ id: userId.insertedId.toString(), email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    let userid = await redis.get(`auth_${token}`);
    if (!userid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    userid = ObjectId(userid);
    const user = await (await db.usersCollection()).findOne({ _id: userid });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
