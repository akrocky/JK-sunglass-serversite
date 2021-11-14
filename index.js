const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

const { MongoClient } = require('mongodb');


const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.26wwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {

    try {
        await client.connect();
        const database = client.db('jk_sunglass');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const odersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        // create a product

        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            console.log('hit add a product', product)
            const result = await productsCollection.insertOne(product);
            res.json(result)
        });
        //get all products
        app.get('/products', async (req, res) => {

            const result = await productsCollection.find({}).toArray();

            res.json(result)
        });
        // get filtering products for men women and new products
        app.get('/products/:filter', async (req, res) => {
            const search = req.params.filter
            let query;
            search === 'men' ? query = { gender: 'men' } : search === 'women' ? query = { gender: 'women' } : query = { catagory: 'new' };

            const result = await productsCollection.find(query).toArray();

            res.json(result)
        });
        // delete a product
        app.delete('/deletedProduct/:id', async (req, res) => {
            const id = req.params.id;


            const result = await productsCollection.deleteOne({ _id: ObjectId(id) });

            res.json(result)
        });
        //// make a order
        app.post('/orders', async (req, res) => {
            const product = req.body;
            const result = await odersCollection.insertOne(product);

            res.json('hit ')
        });
        ///get all orders
        app.get('/orders', async (req, res) => {

            const result = await odersCollection.find({}).toArray();
            console.log('hit the post to order')
            res.json(result)
        });
        ///get my orders
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }

            const result = await odersCollection.find(filter).toArray();

            res.json(result)
        });
        // update all oders

        app.put('/updateOrder', async (req, res) => {
            const id = req.query.search;
            const status = req.query.status;

            const filter = { _id: ObjectId(id) }

            // const filter =_id: 'ObjectId({id})'
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            }

            const result = await odersCollection.updateOne(filter, updateDoc, options);

            res.json(result)
        });


        // delete a order
        app.delete('/deletedOrder/:id', async (req, res) => {
            const id = req.params.id;


            const result = await odersCollection.deleteOne({ _id: ObjectId(id) });

            res.json(result)
        });
        ///users post
        app.post('/users', async (req, res) => {

            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })
        //update user
        app.put('/users', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        ///make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })


        //get admin 

        ////admin get
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query)
            let isAdmin;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            else {
                isAdmin = false;
            }
            res.json({ admin: isAdmin });


        })
        ///make review
        app.post('/reviews', async (req, res) => {

            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        })
        //all review
        app.get('/reviews', async (req, res) => {

            const result = await reviewsCollection.find({}).toArray();

            res.json(result)
        });


    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('jk sunglass website server running')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})