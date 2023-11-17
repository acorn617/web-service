const express = require('express')
const app = express()
// This Express app starts a server( which creates the scaffolding for a full app with numerous JavaScript files, Jade templates, and sub-directories for various purposes.)


app.use(express.static(__dirname + '/public'));
// Express looks up the files in the order in which you set the static directories with the 'express.static' middleware function.

app.set('view engine', 'ejs') 
// Set screen engine to ejs

app.use(express.json())
app.use(express.urlencoded({extended:true})) 
//two codes required for specifically POST requests and PUT Requests (To make it easier to get the data out)

const { MongoClient } = require('mongodb')


let db
const url = 'mongodb+srv://admin:Pikachu1@cluster0.u8fx7lz.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  console.log('success for connecting DB')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
})
//: Connect db to Application

app.listen(8080, () => {
    console.log(' working on http://localhost:8080 ')
})
// Bind and listen to the connections on the specified host and port.

app.get('/', (req , res) => {
  res.sendFile(__dirname+'/index.html')
}) 
// The app responds with showing 'index.html' file for requests to the root URL (/).


app.get('/news', (req , res) => {
  res.send('Raining!')
}) 
// The app responds with “Raining!” for requests to the URL (/news).

app.get('/shop', (req , res) => {
  res.send('shop page!')
}) 
// The app responds with “shop page!” for requests to the URL (/shop).

app.get('/list', async (req , res) => {
  let result = await db.collection('post').find().toArray()
  console.log(result[0].title)
  // res.send(result[0].title)
  res.render('list.ejs',{ posts : result })
})
// Take out the data from db and show it on the list page(/list). 


app.get('/time', (req , res) => {
  let currentTime = new Date() 
  res.render('time.ejs',{ time : currentTime })
}) 
// A page(/time) that shows the current time

app.get('/write', (req , res) => {
  res.render('write.ejs')
}) 


app.post('/add', async (req , res) => {
  await db.collection('post').insertOne(req.body)
  // insertOne({ title : req.body.title, content : req.body.content }) 도 가능
  res.send('작성이 완료되었습니다.')
})



