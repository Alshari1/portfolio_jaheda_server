const express = require('express');
const cors = require('cors');
const app = express()

app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://portfolio-jaheda.web.app'
    ],
    credentials: true
}));

const allowedOrigins = process.env.NODE_ENV === 'production' ? 
    ['https://portfolio-jaheda.web.app'] : 
    ['https://portfolio-jaheda.web.app', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
require('dotenv').config()



const port = process.nextTick.PORT || 5000


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.tjz8e2v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        const portfolioCollection = client.db('portfolioJahedaDB').collection('portfolio')
        const clientCollection = client.db('portfolioJahedaDB').collection('clients')


        app.get('/portfolio', async (req, res) => {
            try {
                if (!portfolioCollection) {
                    return res.status(500).send('Database not connected');
                }
                const cursor = portfolioCollection.find();
                const result = await cursor.toArray();
                res.send(result);

            } catch (error) {
                console.error('Error portfolio:', error);
            }
        });

        app.get('/portfolio/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await portfolioCollection.findOne(query)
            res.send(result)
            // console.log(result)
        })


        app.get('/clients', async (req, res) => {
            try {
                if (!portfolioCollection) {
                    return res.status(500).send('Database not connected');
                }
                const cursor = clientCollection.find();
                const result = await cursor.toArray();
                res.send(result);

            } catch (error) {
                console.error('Error portfolio:', error);
            }
        })

        app.post('/clients', async (req, res) => {
            try {
                const data = req.body;
                const result = await clientCollection.insertOne(data);
                // console.log(data)
                res.send(result)
            } catch (error) {
                res.send(error)
            }
        })
        app.post('/portfolio', async (req, res) => {
            const data = req.body;
            const result = await portfolioCollection.insertOne(data);
            res.send(result)
        })
        app.put('/portfolio/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const data = req.body;
                const query = { _id: new ObjectId(id) }
                const updateDoc = {
                    $set: {
                        thumbnailUrl: data.thumbnailUrl,
                        portfolioUrl: data.portfolioUrl,
                        title: data.title,
                        description: data.description,
                        priceFrom: data.priceFrom,
                        priceTo: data.priceTo,
                        industries: data.industries,
                        durationFrom: data.durationFrom,
                        durationTo: data.durationTo,
                    },
                };
                const result = await portfolioCollection.updateMany(query, updateDoc)
                res.send(result)
            } catch (error) {
                console.log(err)
            }
        })
        app.patch('/portfolio/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const data = parseInt(req.body.updatedText);
                const updatedData = data + 1;
                const query = { _id: new ObjectId(id) }
                const options = { upsert: true };
                const updateDoc = {
                    $set: {
                        heartCount: updatedData
                    },
                };
                const result = await portfolioCollection.updateOne(query, updateDoc, options)
                res.send(result)

            } catch (error) {
                console.log(error)
            }
        })
        app.patch('/clients/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const data = req.body;
                const query = { _id: new ObjectId(id) }
                const updateDoc = {
                    $set: {
                        status: data.status
                    },
                };
                const result = await clientCollection.updateOne(query, updateDoc)
                console.log(result)
                res.send(result)

            } catch (error) {
                console.log(error)
            }
        })

        app.delete('/clients/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await clientCollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/portfolio/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await portfolioCollection.deleteOne(query)
            res.send(result)
        })



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('helloo from server')
})

app.listen(port, () => {
    console.log(`server is flying on PORT:${port}`)
})