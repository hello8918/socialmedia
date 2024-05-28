const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())
app.use('/uploads', express.static("uploads"));

const { connectMySqlDb } = require('./connection.js');

connectMySqlDb();
app.use('/', routes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
