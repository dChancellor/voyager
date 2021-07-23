const request = require('supertest');
const app = require('../app');

const { databases, collectionsHash } = require('../util/config');
const Database = require('../util/database');

describe('test route pathing', () => {
  let newDB = new Database(databases.test.uri, collectionsHash);
  const mockDatabase = 'ohNoYouBrokeSomething';
  const mockUser = { name: 'George Washington', id: '1' };
  const agent = request.agent(app);

  beforeAll(async () => {
    await newDB.connect(mockDatabase);
    await newDB.addUser(mockUser);
  });

  afterAll(async () => {
    await newDB.deleteDatabase(mockDatabase);
    await newDB.disconnect();
  });

  describe.skip('test database authentication practices', () => {
    it('should detect the user is authorized and forward done', async () => {
      let retrievedUser = await newDB.getUserByGoogleId(mockUser.id);
      expect(retrievedUser).toEqual(mockUser);
    });

    it('should detect that attempted user auth is not found in database and log that request', async () => {
      let retrievedUser = await newDB.getUserByGoogleId('this-does-not-exist');
      let response = !retrievedUser ? await newDB.addFailedLogin({ id: 'this-user-did-not-exist' }) : null;
      expect(response).toBeTruthy();
    });
  });

  describe('handles adding the cookie to the superagent', () => {
    const authorizedUser = { user: { name: 'Authorized User' } };
    const unauthorizedUser = { user: { name: 'Unauthorized User' } };

    it('responds with 200', (done) => {
      request(app).get('/').expect(200, done);
    });

    it('redirects with a 302 to the authorization service', (done) => {
      request(app).get('/auth/loggedIn').expect(302).expect('Location', '/oauth/google', done);
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

    it.only('responds with 302 - unauthorized login', (done) => {
      agent
        .get('/auth')
        .expect(302)
        .expect('Location', '/oauth/google')
        .end((err) => {
          if (err) done(err);
          agent.get('/oauth/google').send(unauthorizedUser).expect(302).expect('Location', '/failedLogin', end);
        });
    });

    it('proves the superagent is maintaining cookie storage', (done) => {
      agent.get('/auth/loggedIn').expect(200).expect('Content-Type', /json/).expect({ message: 'It works!' }, done);
    });

    // it('proves the superagent can add a new user', (done) => {
    //   agent.get('/auth/newUser').expect(200, done).expect('Content-Type', /json/).expect({ message: 'It works!' });
    // });
  });
});
