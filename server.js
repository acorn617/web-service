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

const session = require('express-session')
const passport = require('passport') 
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번', //secret :  세션문자열 암호화에 사용, 긴 게 좋다.
  resave : false, //유저가 요청날릴 때 마다 session데이터를 다시 갱신할건지 여부 
  saveUninitialized : false //유저가 로그인 안해도세션을 저장해둘지 여부 (false 추천)
}))

app.use(passport.session()) 


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
  

  // 게시글 삭제
  app.delete('/delete', async (req , res)=>{
    let result = await db.collection('post').deleteOne( { _id : new ObjectId(req.query.docid) } )
    res.send('삭제 완료')
    console.log(req.query.docid+'의 삭제 완료')
  })


  //페이지네이션 
  app.get('/list/:page', async (req , res) => {
    let result = await db.collection('post').find().skip( (req.params.page - 1) * 5 ).limit(5).toArray() 
    res.render('list.ejs', { posts : result })
  }) 
    


  // 로그인 페이지 겟요청
  app.get('/login', (req , res)=>{
    res.render('login.ejs')
  }) 

  // 로그인 라이브러리
  passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    try {
      let result = await db.collection('user').findOne({ username: 입력한아이디 }); // DB에서 입력한 아이디와 일치하는 유저를 찾습니다.
      
      if (!result) {
        return cb(null, false, { message: '아이디가 존재하지 않습니다.' }); // 아이디가 DB에 없을 경우, 실패 메시지와 함께 검증 실패를 알립니다.
      }
      
      if (result.password !== 입력한비번) {
        return cb(null, false, { message: '비밀번호가 일치하지 않습니다.' }); // 비밀번호가 일치하지 않을 경우, 실패 메시지와 함께 검증 실패를 알립니다.
      }
      
      return cb(null, result); // 아이디와 비밀번호가 일치하는 경우, 검증 성공을 알립니다.
    } catch (error) {
      return cb(error); // 에러가 발생한 경우, 에러를 전달합니다.
    }
  }));


  app.post('/login', async (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
      if (error) return res.status(500).json(error); // 에러가 발생한 경우, 500 상태 코드와 에러를 JSON 형식으로 반환합니다.
      if (!user) return res.status(401).json(info.message); // 유저 정보가 없는 경우, 401 상태 코드와 실패 메시지를 JSON 형식으로 반환합니다.
      req.logIn(user, (err) => {
        if (err) return next(err); // 로그인 과정에서 에러가 발생한 경우, 다음 미들웨어로 에러를 전달합니다.
        res.redirect('/'); // 로그인이 성공한 경우, 홈페이지로 리다이렉트합니다.
      });
    })(req, res, next);
  });

  // 세션을 만들어주는 코드
  passport.serializeUser((user, done) => { //- 유저가 로그인 성공할 때 마다 자동으로 세션이 만들어집니다.
    process.nextTick(() => { //그 세션 document의 _id가 적힌 쿠키를 하나 만들어서 유저에게 보내줄겁니다
      done(null, { id: user._id, username: user.username })
    })
  })

  // 에러 처리 미들웨어 추가
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

 

