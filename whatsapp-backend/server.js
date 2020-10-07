//importing

import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

//app config

const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: '',
    key: '',
    secret: '',
    cluster: 'ap2',
    encrypted: true
  });

//middleware

app.use(express.json());
app.use(cors())

// app.use((req,res,next)=>{          //cors in also doing the same thing
//     res.setHeader("Access-Control-Allow-Origin", "*")
//     res.setHeader("Access-Control-Allow-Headers", "*")
//     next()
// })

//DB config

const connection_url = ''
mongoose.connect(connection_url,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection

db.once('open',()=>{
    console.log("DB connected")

    const msgCollection = db.collection('messagecontents')
    const changestream = msgCollection.watch()

    changestream.on("change", (change)=>{ //here we use this to monitor real time data changes in mongo db
        console.log("A change occured",change)

        if(change.operationType==='insert'){
            const messageDetails = change.fullDocument; //saving the document part of the change in the variable
            pusher.trigger('messages', 'inserted',  //we create pusher channel this way
            {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        } else{
            console.log('Error triggering Pusher')
        }
    })
})

//api routes

app.get('/', (req, res)=> res.status(200).send('hello world'))

app.get('/messages/sync', (req,res)=>{
    Messages.find((err, data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data)=>{
        if(err){
            res.status(500).send(err)
        } else{
            res.status(201).send(data)
        }
    })
})

//listen

app.listen(port,()=>console.log(`Listening on localhost:${port}`))
