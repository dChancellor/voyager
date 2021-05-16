const app = require('./app')
require('dotenv').config();

app.listen(process.env.PORT, () => {
  console.log(`Listening at http://${process.env.HOST}:${process.env.PORT}`);
});
