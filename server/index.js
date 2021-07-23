const app = require('./app');
const { hostname, port } = require('./util/config');

app.listen(process.env.PORT, () => console.log(`Listening at http://${hostname}:${port}`));
