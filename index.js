const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); 
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
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
    const bookingsCollection = db.collection("bookings"); 

    // --- Cars Endpoints ---
    app.get('/cars', async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.send(result);
    });

    app.get('/cars/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await carsCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).send({ success: false, message: "Car not found" });
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    app.get("/cars/email/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const result = await carsCollection.find({ providerEmail: email }).toArray();
        res.send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    app.post("/cars", async (req, res) => {
      try {
        const data = req.body; 
        if (!data.brand || !data.model || !data.image) {
          return res.status(400).send({ success: false, message: "Brand, model, and image are required" });
        }
        const result = await carsCollection.insertOne(data);
        res.send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    app.put("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await carsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        if (result.matchedCount === 0) return res.status(404).send({ success: false, message: "Car not found" });
        res.send({ success: true, message: "Car updated successfully" });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    app.delete("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).send({ success: false, message: "Car not found" });
        res.send({ success: true });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    // --- Bookings Endpoints ---
    app.get('/bookings', async (req, res) => {
      try {
        const bookings = await bookingsCollection.find().toArray();
        res.send({ success: true, result: bookings });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    
    app.post('/bookings', async (req, res) => {
      try {
        const bookingData = req.body;
        const { carId, userEmail, pickupDate, returnDate } = bookingData;

        if (!carId || !userEmail || !pickupDate || !returnDate) {
          return res.status(400).send({ success: false, message: "Missing required fields" });
        }

        // Insert booking
        const result = await bookingsCollection.insertOne(bookingData);

        // Update car status
        await carsCollection.updateOne(
          { _id: new ObjectId(carId) },
          { $set: { isAvailable: false } } // corrected field
        );

        res.send({ success: true, result, message: "Car booked successfully!" });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
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
