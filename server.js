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

const { MongoClient,ObjectId } = require('mongodb')



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
    console.log('working on http://localhost:8080 ')
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




app.get('/time', (req , res) => {
  let currentTime = new Date() 
  res.render('time.ejs',{ time : currentTime })
}) 
// A page(/time) that shows the current time

app.get('/write', (req , res) => {
  res.render('write.ejs')
}) 


app.post('/add', async (req , res) => {
  if (req.body.title == '') {
    res.send('제목을 적어주세요')
  } else {
    try {
      await db.collection('post').insertOne({ title : req.body.title, content : req.body.content })
    } catch (e) {
      console.log(e)
      res.send('DB error')
    } 
    res.redirect('/list/1') 
  }
  })


  // db.collection.insertOne():Inserts a new document in a collection.

  // app.get('/detail/:id',async (req , res) => {
  //   let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id) })
  //   console.log(req.params) 
  //   res.render('detail.ejs', { result : result })
  // })

  app.get('/detail/:id', async (req , res) => {
    try  {
      let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id) })
      if (result == null) {
        res.status(400).send('없는 게시물 입니다')
      } else {
        res.render('detail.ejs', { result : result })
      }
      
    } catch (e){
      res.send('잘못된 요청입니다')
    }
    
  })


  // 1) If someone accesses /detail/1234,execute the code
  // 2) find a content whose id is "1234" in the DB
  // 3) Put it in the 'detail.ejs file' and send it to the user
  // const { ObjectId } = require('mongodb')  >> code for using 'ObjectId()'
  // add exception handling

  app.get('/edit/:id', async(req , res) => {
    let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id) })
    res.render('edit.ejs', {result : result})
  })


  app.post('/edit', async (req , res)=>{
    await db.collection('post').updateOne({ _id : new ObjectId(req.body.id) },
      {$set : { title : req.body.title, content : req.body.content }
    })
    res.redirect('/list/1')
    console.log(req.body.id+'의 수정 완료')
  }) 
  

  // 삭제 기능 추가
  app.delete('/delete', async (req , res)=>{
    let result = await db.collection('post').deleteOne( { _id : new ObjectId(req.query.docid) } )
    res.send('삭제 완료')
    console.log(req.query.docid+'의 삭제 완료')
  })


  //페이지네이션  추가

  app.get('/list/:page', async (req , res) => {
    let result = await db.collection('post').find().skip( (req.params.page - 1) * 5 ).limit(5).toArray() 
    res.render('list.ejs', { posts : result })
  }) 
    