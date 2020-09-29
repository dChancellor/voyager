// Initializes MongoDB connection
// TODO Remove LOCAL version
const {db, urls, users, failedRequests} = require('../lib/constants')

function initialize() {
// Makes urls db with an index for slug with as a unique PK
urls.createIndex({ slug: 1 }, { unique: true });
//Makes users db with an index for the userid (eventually from google)
users.createIndex('userid');
failedRequests.createIndex('userid')
}


module.exports = initialize;