const app = require('./app');
const { db, hostname, port, databases, environment } = require('./lib/config');

db.connect(databases[environment].database).then(() =>
  app.listen(process.env.PORT, () => console.log(`Listening at http://${hostname}:${port}`)),
);
