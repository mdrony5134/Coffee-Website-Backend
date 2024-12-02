const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.port || 5000;

app.use(
  cors({
    origin: "https://coffee-website-dfa3e.web.app/", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ajv0g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("user");

    app.get("/coffees", async (req, res) => {
      const cursor = coffeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      // console.log(newCoffee);
      const result = await coffeCollection.insertOne(newCoffee);
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await coffeCollection.findOne(qurey);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const coffe = req.body;
      const updatedCoffee = {
        $set: {
          name: coffe.name,
          chef: coffe.chef,
          suplier: coffe.suplier,
          taste: coffe.taste,
          category: coffe.category,
          details: coffe.details,
          photo: coffe.photo,
        },
      };

      const result = await coffeCollection.updateOne(
        filter,
        updatedCoffee,
        options
      );
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await coffeCollection.deleteOne(qurey);
      res.send(result);
    });

    // user collection data

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("coffe server running");
});

app.listen(port, () => {
  console.log(`Server running:http://localhost:${port}`);
});
