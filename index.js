const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 5000;

//middlwware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ec0jk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("fashion_shop");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const blogsCollection = database.collection("blogs");
    console.log("Database connected");
    //GET All Products
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    //Get Single Product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    });

    //Product Post
    app.post("/products", async (req, res) => {
      const name = req.body.name;
      const description = req.body.description;
      const price = req.body.price;
      const rating = req.body.rating;
      const stock = req.body.stock;
      const img = req.files.image;
      const imgData = img.data;
      const encodedPic = imgData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const product = {
        name,
        description,
        price,
        rating,
        stock,
        image: imageBuffer,
      };
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    //Delete Product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });

    //Post Orders
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    //get Orders
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //Post Reviews
    app.post("/reviews", async (req, res) => {
      const name = req.body.name;
      const description = req.body.description;
      const rating = req.body.rating;
      const img = req.files.image;
      const imgData = img.data;
      const encodedPic = imgData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const review = {
        name,
        description,
        rating,
        image: imageBuffer,
      };
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    //Get Reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    //Post Blogs
    app.post("/blogs", async (req, res) => {
      const title = req.body.title;
      const description = req.body.description;
      const author = req.body.author;
      const img = req.files.image;
      const imgData = img.data;
      const encodedPic = imgData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const blog = {
        title,
        description,
        author,
        image: imageBuffer,
      };
      const result = await blogsCollection.insertOne(blog);
      res.json(result);
    });

    //Get Blogs
    app.get("/blogs", async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.json(blogs);
    });

    //Post Users to the database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //Get Users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });
    //PUT APi google sign in user email upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //check admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    //make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Delete Order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //Update order status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

//get
app.get("/", (req, res) => {
  res.send("Fashion Shop Server is Running.");
});

//listen
app.listen(port, () => {
  console.log("server is running at port ", port);
});
