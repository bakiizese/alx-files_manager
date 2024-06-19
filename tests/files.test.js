import {
  expect, use, should, request,
} from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import { ObjectId } from 'mongodb';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('testing User Endpoints', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  let userId = '';
  const user = {
    email: 'bob@dylan.com',
    password: 'toto1234!',
  };

  before(async () => {
    await redisClient.client.flushall('ASYNC');
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });

  after(async () => {
    await redisClient.client.flushall('ASYNC');
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });

  describe('pOST /users', () => {
    it('returns the id and email of created user', async () => {
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body.email).to.equal(user.email);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      userId = body.id;
      const userMongo = await dbClient.usersCollection.findOne({
        _id: ObjectId(body.id),
      });
      expect(userMongo).to.exist;
    });

    it('fails to create user because password is missing', async () => {
      const user = {
        email: 'bob@dylan.com',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing password' });
      expect(response.statusCode).to.equal(400);
    });

    it('fails to create user because email is missing', async () => {
      const user = {
        password: 'toto1234!',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Missing email' });
      expect(response.statusCode).to.equal(400);
    });

    it('fails to create user because it already exists', async () => {
      const user = {
        email: 'bob@dylan.com',
        password: 'toto1234!',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      expect(body).to.eql({ error: 'Already exist' });
      expect(response.statusCode).to.equal(400);
    });
  });
});
