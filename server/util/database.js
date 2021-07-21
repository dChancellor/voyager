const { MongoClient, ObjectId } = require('mongodb');

class Database {
  constructor(uri) {
    this.uri = uri;
    this.connection;
    this.db;
  }

  async connect(databaseName) {
    this.connection = await MongoClient.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = await this.connection.db(databaseName);
    return this.connection;
  }

  async disconnect() {
    return this.connection.close();
  }
  async status() {
    return this.db.serverConfig.isConnected();
  }

  async createDatabase(databaseName, collectionName) {
    let newDatabase = await this.connection.db(databaseName);
    await newDatabase.createCollection(collectionName);
    return newDatabase;
  }
  async deleteDatabase(databaseName) {
    await this.connection.db(databaseName).dropDatabase();
  }
  async listAllDatabases() {
    return await this.db.admin().listDatabases();
  }
  async createCollection(collectionName) {
    return await this.db.createCollection(collectionName);
  }
  async clearCollection(collectionName) {
    return await this.db.collection(collectionName).deleteMany({});
  }
  async deleteCollection(collectionName) {
    return await this.db.dropCollection(collectionName);
  }
  async listAllCollections() {
    return await this.db.listCollections().toArray();
  }
  async addUser(user) {
    const users = this.db.collection('users');
    return await users
      .insertOne(user)
      .then((res) => res)
      .catch((err) => this.errorLogger(err));
  }
  async getUserById(id) {
    const users = this.db.collection('users');
    return users.findOne(ObjectId(id));
  }
  async getUserByGoogleId(id) {
    const users = this.db.collection('users');
    return await users.findOne({ id });
  }
  async addFailedLogin(userObject) {
    const failedRequests = this.db.collection('failedRequests');
    return await failedRequests.insertOne(userObject);
  }
  async deleteUserById(id) {
    const users = this.db.collection('users');
    return await users.deleteOne({ _id: id });
  }
  async createNewSlug(slug, url) {
    const urls = this.db.collection('urls');
    return urls
      .insertOne({ slug, url })
      .then((res) => res)
      .catch((err) => this.errorLogger(err));
  }
  async getUrlFromSlug(slug) {
    const urls = this.db.collection('urls');
    let result = await urls.findOne({ slug });
    return result || null;
  }
  async getSlugsFromUrl(url) {
    const urls = this.db.collection('urls');
    return urls.find({ url }).toArray();
  }
  async errorLogger(error) {
    const errors = this.db.collection('errors');
    errors.insertOne({ error, dateTime: new Date() });
    return { message: `Error code ${error.code} was logged` };
  }
}

module.exports = Database;
