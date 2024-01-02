// import MongoClient and ServerApiVersion from mongodb
const { MongoClient, ServerApiVersion } = require("mongodb");

const dbName = "stripe-users";

const url = "mongodb://127.0.0.1:27017";

// create new MongoClient instance and export it
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

module.exports = client;
