const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

//user: excellentBicycle
// password: WT7cxqdKln969US3



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1i5y6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
        try{
            await client.connect();
            const database = client.db('excellentBicycle');
            const productsCollection = database.collection('products');
            const ordersCollection = database.collection('orders');
            const commentsCollection = database.collection('comments');
            const usersCollection = database.collection('users');

            //GET API
            app.get('/products', async (req, res) =>{
                const cursor = productsCollection.find({});
                const products = await cursor.toArray();
                res.send(products);
            })

            //GET Single Product
            app.get('/products/:id', async(req, res) =>{
                const id = req.params.id;
                const query = {_id: ObjectId(id)};
                const product = await productsCollection.findOne(query);
                res.json(product);
            })
            // POST API
            app.post('/products', async(req, res) =>{
                const product = req.body;
                console.log('hit the post api', product); 

                const result = await productsCollection.insertOne(product);
                res.json(result);
                
            })

            //Delete product
            app.delete('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            console.log('deleting user with id', result);
            res.json(result);
        })

        //Get email order
        app.get('/order', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email}
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })

            //POST Order
            app.post('/orders', async(req, res) =>{
                const order = req.body;
                const result = await ordersCollection.insertOne(order);
                res.json(result);
            })

            //GET Order API
            app.get('/orders', async (req, res) =>{
                const cursor = ordersCollection.find({});
                const orders = await cursor.toArray();
                res.send(orders);
            })

            app.delete('/orders/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting user with id', result);
            res.json(result);
        })

        //POST Comment
            app.post('/comment', async(req, res) =>{
                const comment = req.body;
                const result = await commentsCollection.insertOne(comment);
                res.json(result);
            })

        //GET Comments
        app.get('/comment', async (req, res) =>{
            const cursor = commentsCollection.find({});
            const comments = await cursor.toArray();
            res.send(comments);
        })

        app.get('/users/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user.role === 'admin'){
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //Post Users
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async(req, res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = { $set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async(req, res)=>{
            const user = req.body;
            console.log('put', user);
            const filter = {email: user.email};
            const updateDoc ={$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json();
        });
        
        }
        finally{
            //await client.close();
        }
}

run().catch(console.dir);

app.get('/',(req, res) => {
    res.send('Running bicycle Server');
})

app.listen(port, () => {
    console.log('Running Server on port', port);
})