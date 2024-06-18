const sha1 = require('sha1');
const db = require('../utils/db');

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
    const userId = await (await db.usersCollection()).insertOne({ email, hashed });
    res.status(201).json({ id: userId.insertedId.toString(), password: hashed });
  }
}

module.exports = UsersController;
