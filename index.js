const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.osbiw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const  port = 5000;
app.get('/', (req, res) =>{
    res.send("hello from db it's working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology:true });
client.connect(err => {
  const ordersCollection = client.db("creativeAgency").collection("orders");
  const adminCollection  = client.db("creativeAgency").collection("admin");
  const reviewCollection = client.db("creativeAgency").collection("review")
  const servicesCollection = client.db("creativeAgency").collection("service")

  app.post('/addAOrder',(req, res) => {

      const name= req.body.name;
      const email = req.body.email;
      const serviceName= req.body.serviceName;
      const text = req.body.text;
      const price = req.body.price;
      
        ordersCollection.insertOne({name,email,serviceName,text,price})
        .then(result => {
            res.send(result.insertedCount > 0)
          });
    })
    app.get('/showServices', (req,res) => {
      servicesCollection.find({})
      .toArray((err, serviceDocument) => {
        res.send(serviceDocument);
      })
    })

    app.post('/addService',(req,res) => {
        const file = req.files.file;
        const name = req.body.name;
        const des = req.body.des;
        const newImg = file.data;
        const encImg = newImg.toString('base64')

        const image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
        }
        servicesCollection.insertOne({name,des, image})
        .then(result => {
          res.send(result.insertedCount > 0)
        })
    })


    app.get('/showOrder', (req, res) => {
        ordersCollection.find({email: req.query.email})
        .toArray((err ,orderDocument) => {
          res.send(orderDocument)
        })
    })

    app.get('/allOrderedService',(req, res) => {
      ordersCollection.find({})
      .toArray((err, allOrderedDocument) =>  {
        res.send(allOrderedDocument)
      })
    })
    app.post('/sendReview',(req, res) => {
      const review = req.body;
      reviewCollection.insertOne(review)
      .then(result =>  {
        res.send(result)
      })
    })

  app.get('/getReview' , (req, res) =>  {
    reviewCollection.find({})
    .toArray((err,reviewDocument) =>  {
      res.send(reviewDocument)
    })
  })



    app.get('/admin', (req, res) => {
      const email = req.query.email;
      console.log(email);
      adminCollection.find({ email })
        .toArray((err, collection) => {
          res.send(collection.length > 0)
        })
  
    })

    app.post('/makeAdmin', (req, res) => {
      const email = req.body.email;
      const pass = req.body.password;
      console.log(email);
      adminCollection.insertOne({ email, pass })
        .then(result => {
          console.log(result);
          res.send(result)
        })
    })
});



app.listen(process.env.PORT || port)