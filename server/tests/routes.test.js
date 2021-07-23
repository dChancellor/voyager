const request = require('supertest');
const app = require('../app');

const { db, client } = require('../util/config');

describe('test unauthorized route pathing', () => {
  const agent = request.agent(app);
  const unauthorizedUser = { user: { name: 'Unauthorized User' } };

  beforeAll(async () => {
    await db.connect('routes-test');
    await db.createNewSlug('goog', 'google.com');
  });

  afterAll(async () => {
    await db.deleteDatabase('routes-test');
    await db.disconnect();
  });
  it('responds with 200', (done) => {
    request(app).get('/').expect(200, done);
  });

  it('finds peace', (done) => {
    request(app)
      .get('/serenity')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ message: 'You have found peace' }, done);
  });

  it('returns a redirect to the url found with given slug', async (done) => {
    await db.createNewSlug('goog', 'google.com');
    request(app).get('/goog').expect(302, done);
  });

  it('finds a no slug found 404 page', (done) => {
    request(app).get('/no-slug').expect(404, done);
  });

  it('returns a list of slugs from a given url', async (done) => {
    await db.createNewSlug('goog', 'google.com');
    request(app)
      .get('/url')
      .send({ url: 'https://www.google.com' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(async (err, res) => {
        if (err) return done(err);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0].slug).toEqual('goog');
        done();
      });
  });

  it('returns a 404 with no slugs found for given url', async (done) => {
    request(app)
      .get('/url')
      .send({ url: 'https://www.fakeurl.com' })
      .expect(404)
      .expect('Content-Type', /json/)
      .expect({ message: 'Url not found' }, done);
  });

  it('returns a not-found error', (done) => {
    request(app).get('/serenity/test').expect(404, done);
  });

  it('redirects with a 302 to the authorization service', (done) => {
    request(app).get('/auth/loggedIn').expect(302).expect('Location', '/oauth/google', done);
  });

  it('responds with 401 - unauthorized login when using an unauthorized user', (done) => {
    request(app)
      .get('/auth')
      .expect(302)
      .expect('Location', '/oauth/google')
      .end((err) => {
        if (err) done(err);
        agent
          .get('/oauth/google')
          .send(unauthorizedUser)
          .expect(302)
          .expect('Location', '/failedLogin')
          .end((err, req) => {
            if (err) done(err);
            agent.get('/failedLogin').expect(401, done);
          });
      });
  });

  describe('handles adding the cookie to the superagent and all authorized routing', () => {
    const authorizedUser = { user: { name: 'Authorized User' } };
    const newUser = { id: '123', name: 'J.R.R.', email: 'frodoisunderrated@fake.com' };

    beforeAll(async () => {
      await db.connect();
      await db.clearCollection('users');
      await db.clearCollection('failedRequests');
      await db.clearCollection('errors');
      await db.clearCollection('urls');
    });

    afterAll(async () => {
      await db.clearCollection('users');
      await db.clearCollection('failedRequests');
      await db.clearCollection('errors');
      await db.clearCollection('urls');
      await db.disconnect();
    });

    it('proves the superagent is not authorized', (done) => {
      agent.get('/auth/loggedIn').expect(302, done);
    });

    it('responds with 200 - Authorized Superagent', (done) => {
      agent
        .get('/auth')
        .expect(302)
        .expect('Location', '/oauth/google')
        .end((err) => {
          if (err) done(err);
          agent
            .get('/oauth/google')
            .send(authorizedUser)
            .expect(302)
            .expect('Location', '/auth/loggedIn')
            .end((err) => {
              if (err) done(err);
              agent.get('/auth/loggedIn').expect(200, done);
            });
        });
    });

    it('proves the superagent is maintaining cookie storage', (done) => {
      agent.get('/auth/loggedIn').expect(200).expect('Content-Type', /json/).expect({ message: 'It works!' }, done);
    });

    it('travels the newSlug route and successfully adds a randomized slug', (done) => {
      agent
        .post('/auth/newSlug')
        .send({ url: 'https://chancellor.tech' })
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.url).toEqual('chancellor.tech');
          done();
        });
    });

    it('travels the newSlug route and successfully adds a randomized slug', (done) => {
      agent
        .post('/auth/newSlug')
        .send({ slug: 'me', url: 'https://chancellor.tech' })
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.url).toEqual('chancellor.tech');
          expect(res.body.forcedToRegenerate).toEqual(false);
          expect(res.body.slug).toEqual('me');
          done();
        });
    });

    it('travels the newSlug route and is forced to regenerate a new slug', async (done) => {
      await db.createNewSlug('goog', 'google.com');
      agent
        .post('/auth/newSlug')
        .send({ slug: 'goog', url: 'https://chancellor.tech' })
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body.url).toEqual('chancellor.tech');
          expect(res.body.forcedToRegenerate).toEqual(true);
          done();
        });
    });

    it('travels the newSlug route and returns an error adding the slug due to invalid url', (done) => {
      agent
        .post('/auth/newSlug')
        .send({ slug: 'test', url: 'this-is-an-invalid-url' })
        .expect(404)
        .end((err, res) => {
          expect(res.body).toHaveProperty('message', 'URL is not valid');
          if (err) done(err);
          done();
        });
    });

    it('throws an error if you try and shorten the client', (done) => {
      agent
        .post('/auth/newSlug')
        .send({ url: client })
        .expect(500)
        .end((err, res) => {
          expect(res.body).toHaveProperty('message', 'No recursion 🤚');
          if (err) done(err);
          done();
        });
    });

    it('travels the newUser route and successfully adds a user', (done) => {
      agent
        .post('/auth/newUser')
        .send(newUser)
        .expect(200)
        .end((err, res) => {
          if (err) done(err);
          expect(res.body).toHaveProperty('id', newUser.id);
          expect(res.body).toHaveProperty('name', newUser.name);
          expect(res.body).toHaveProperty('email', newUser.email);
          done();
        });
    });
    it('travels the newUser route and attempts to add an already existing User', (done) => {
      agent.post('/auth/newUser').send(newUser).expect(500, done);
    });
  });
});
