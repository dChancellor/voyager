const app = require('./src/app')
require('dotenv').config();

app.listen(process.env.PORT, () => {
  console.log(`Listening at ${process.env.DOMAIN}:${process.env.PORT}`);
});
