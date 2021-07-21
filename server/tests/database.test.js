const { databases } = require('../util/config');
const Database = require('../util/database');

describe.only('test the Database class architecture', () => {
  let db = new Database(databases.test.uri);
  const mockDatabase = 'ifYouSeeThisSomethingWentHorriblyWrong';
  const mockCollection = 'ifYouSeeThisSomethingWentHorriblyWrong';
  const mockUser = { name: 'George Washington', id: '1' };
  const mockSecondUser = { name: 'Plato', id: '22523' };

  beforeAll(async () => {
    await db.connect(mockDatabase);
  });

  afterAll(async () => {
    await db.connect(mockDatabase);
    await db.deleteDatabase(mockDatabase);
    await db.disconnect();
  });

  it('should connect to the database', async () => {
    let status = db.status();
    expect(status).toBeTruthy();
  });

  it('should create a new test database', async () => {
    await db.createDatabase(mockDatabase, 'users');
    let { databases } = await db.listAllDatabases();
    let doesExist = databases.some(({ name }) => name === mockDatabase);
    expect(doesExist).toBeTruthy();
  });

  it('should create another mock collection', async () => {
    await db.createCollection(mockCollection);
    let listOfCollections = await db.listAllCollections();
    expect(listOfCollections.length).toBe(2);
  });

  it('should insert a user into the collection', async () => {
    let user = await db.addUser(mockUser);
    expect(user.insertedCount).toEqual(1);
  });

  it('should fail to insert a duplicate user into the collection and log the error', async () => {
    let { message } = await db.addUser(mockUser);
    expect(message).toBeTruthy();
  });

  it('should retrieve a user from the collection by db _id', async () => {
    let { insertedId } = await db.addUser(mockSecondUser);
    let retrievedUser = await db.getUserById(insertedId);
    expect(retrievedUser.id).toEqual(mockSecondUser.id);
  });

  it('should retrieve a user from the collection by google id', async () => {
    let retrievedUser = await db.getUserByGoogleId(mockUser.id);
    expect(retrievedUser).toEqual(mockUser);
  });

  it('should detect that attempted user auth is not found in database and log that request', async () => {
    let retrievedUser = await db.getUserByGoogleId('this-does-not-exist');
    let response = !retrievedUser ? await db.addFailedLogin({ id: 'this-user-did-not-exist' }) : null;
    expect(response).toBeTruthy();
  });

  it('should delete a user from the collection and retrieve null', async () => {
    let { deletedCount } = await db.deleteUserById(mockUser._id);
    let retrievedUser = await db.getUserById(mockUser._id);
    expect(deletedCount).toBe(1);
    expect(retrievedUser).toBeNull();
    let { insertedCount } = await db.addUser(mockUser);
  });

  it('should delete a collection from the test database', async () => {
    let originalListOfCollections = await db.listAllCollections();
    await db.deleteCollection(mockCollection);
    let listOfCollections = await db.listAllCollections();
    expect(listOfCollections.length).toBe(originalListOfCollections.length - 1);
  });

  it('should delete the test database', async () => {
    await db.deleteDatabase(mockDatabase);
    let { databases } = await db.listAllDatabases();
    let doesExist = databases.some(({ name }) => name === mockDatabase);
    expect(doesExist).toBeFalsy();
  });

  it('should disconnect the connection to the database', async () => {
    await db.disconnect();
    let status = await db.status();
    expect(status).toBeFalsy();
  });
});
