const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
const app = express()
const port = 3000
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
        const carsCollection = db.collection("cars");

        app.get('/cars', async (req, res) => {
            const result = await carsCollection.find().toArray();
            res.send(result)
    }) 


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

//car_rental:Xz61pfPv455xDNeI
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
