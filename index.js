const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); 
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://car_rental:Xz61pfPv455xDNeI@cluster0.n063kih.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("car-rental-db");
    carsCollection = db.collection("cars"); // <- make it global

    app.get('/cars', async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.send(result);
    });

    // Get a specific car by ID
app.get('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Query by string ID (matches your JSON _id)
    const result = await carsCollection.findOne({ _id: id });

    if (!result) {
      return res.status(404).send({ success: false, message: "Car not found" });
    }

    res.send({ success: true, result });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // optional: await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});