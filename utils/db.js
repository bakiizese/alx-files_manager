const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

const uri = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.checkalive = false;

    this.client.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      this.checkalive = false;
    });

    this.client.on('connect', () => {
      console.log('Connected to MongoDB');
      this.checkalive = true;
    });

    this.client.connect().catch((err) => {
      console.error('MongoDB connection error on initial connect:', err);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async findUser(query) {
    return this.client.db().collection('users').findOne({ query });
  }

  async insertUser(email, password) {
    const newUser = this.client.db().collection('users').insertOne({ email, password });
    return newUser.insertedId.toString();
  }

  async usersCollection() {
    return this.client.db().collection('users');
  }

  async filesCollection() {
    return this.client.db().collection('files');
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
