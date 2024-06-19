const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const redis = require('../utils/redis');
const db = require('../utils/db');

const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    let token = req.headers['x-token'];
    token = `auth_${token}`;
    const userid = await redis.get(token);
    const user = await (await db.usersCollection()).findOne({ _id: ObjectId(userid) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body && req.body.parentId ? req.body.parentId : 0;
    const isPublic = req.body && req.body.isPublic ? req.body.isPublic : false;
    const data = req.body ? req.body.data : null;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const types = ['folder', 'file', 'image'];
    if (!type || !types.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const findByparent = await (await db.filesCollection()).findOne({ _id: ObjectId(parentId) });
      if (!findByparent) {
        return res.status(400).json({ error: 'Parent not found' });
      } if (findByparent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      const newFilefolder = await (await db.filesCollection()).insertOne({
        userId: user._id, name, type, parentId, isPublic,
      });
      const dir = path.dirname(folderPath);
      fs.mkdir(dir, { recursive: true }, () => {});

      return res.status(201).json({
        id: newFilefolder.insertedId, userId: user._id, name, type, isPublic, parentId,
      });
    }

    const uuidName = uuidv4();
    const dir = path.dirname(`${folderPath}/${uuidName}`);

    const dataBase64 = Buffer.from(data, 'base64').toString('utf-8');
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (!err) {
        fs.writeFile(`${folderPath}/${uuidName}`, dataBase64, () => {});
      }
    });

    const newFile = await (await db.filesCollection()).insertOne({
      userId: user._id, name, type, parentId, isPublic, localPath: `${folderPath}/${uuidName}`,
    });

    return res.status(201).json({
      id: newFile.insertedId, userId: user._id, name, type, isPublic, parentId,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const ids = req.params.id;
    const userid = await redis.get(`auth_${token}`);
    const user = await (await db.usersCollection()).findOne({ _id: ObjectId(userid) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const findFile = await (await db.filesCollection())
      .findOne({ _id: ObjectId(ids), userId: ObjectId(userid) });
    if (!findFile) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(findFile);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userid = await redis.get(`auth_${token}`);
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;
    const skip = page * limit;
    const user = await (await db.usersCollection()).findOne({ _id: ObjectId(userid) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pipeline = [
      req.query.parentId ? { $match: { parentId: ObjectId(req.query.parentId) } } : { $match: {} },
      { $skip: skip },
      { $limit: limit },
    ];

    const arrayFile = await (await db.filesCollection()).aggregate(pipeline).toArray();
    return res.status(200).json(arrayFile);
  }
}

module.exports = FilesController;
