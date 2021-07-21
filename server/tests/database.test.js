const { databases } = require('../lib/config');
const Database = require('../lib/database');

describe('test the Database class architecture', () => {
  let db = new Database(databases.test.uri);
  const mockDatabase = 'ifYouSeeThisSomethingWentHorriblyWrong';
  const mockCollection = 'ifYouSeeThisSomethingWentHorriblyWrong';
  const mockUser = { _id: 'some-user-id', name: 'John' };

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

  it('should insert a user into the collection and then retrieve it', async () => {
    let { insertedCount } = await db.addUser(mockUser);
    let retrievedUser = await db.getUserById(mockUser._id);
    expect(retrievedUser).toEqual(mockUser);
    expect(insertedCount).toEqual(1);
  });

  it('should delete a user from the collection and retrieve null', async () => {
    let { deletedCount } = await db.deleteUserById(mockUser._id);
    let retrievedUser = await db.getUserById(mockUser._id);
    expect(deletedCount).toBe(1);
    expect(retrievedUser).toBeNull();
  });

  it('should delete a collection from the test database', async () => {
    await db.deleteCollection(mockCollection);
    let listOfCollections = await db.listAllCollections();
    expect(listOfCollections.length).toBe(1);
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
