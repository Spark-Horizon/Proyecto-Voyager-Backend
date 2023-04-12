const express = require('express');
const logger = require('./logger');
const app = express();
//For MongoDB connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = process.env.URI;

app.use(logger);

app.get('/', (req, res) => {
  const test = {
    message: 'works!'
  }

  res.json(test);
  res.send('works');
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});

// MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Ping to check connection (optional)
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);