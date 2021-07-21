const { MongoClient } = require('mongodb');

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
    console.log(`Connected to database: ${databaseName}`);
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
    return await users.insertOne(user);
  }
  async getUserById(id) {
    const users = this.db.collection('users');
    return await users.findOne({ _id: id });
  }
  async deleteUserById(id) {
    const users = this.db.collection('users');
    return await users.deleteOne({ _id: id });
  }
  async createNewSlug(slug, url) {
    const urls = this.db.collection('urls');
    return await urls.insertOne({ slug, url });
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
}

module.exports = Database;
