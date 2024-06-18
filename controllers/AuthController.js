const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const redis = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    const base64auth = auth.slice(6);
    const base64 = Buffer.from(base64auth, 'base64').toString('utf-8');
    const [email, password] = base64.split(':');

    const user = await (await db.usersCollection()).findOne({ email });
    if (user) {
      const hpassword = user.password;
      if (sha1(password) === hpassword) {
        const token = uuidv4();
        const tokenr = `auth_${token}`;
        await redis.set(tokenr, user._id.toString(), 86400);
        return res.status(200).json({ token });
      }
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const userid = await redis.get(`auth_${token}`);
    if (!userid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await (await db.usersCollection()).findOne({ _id: ObjectId(userid) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redis.del(`auth_${token}`);
    return res.status(204).json();
  }
}

module.exports = AuthController;
