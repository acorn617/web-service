const express = require('express')
const app = express()
// This Express app starts a server( which creates the scaffolding for a full app with numerous JavaScript files, Jade templates, and sub-directories for various purposes.)

app.listen(8080, () => {
    console.log(' working on http://localhost:8080 ')
})
// Bind and listen to the connections on the specified host and port.

app.get('/', (req , res) => {
  res.send('Hello World!')
}) 
// The app responds with “Hello World!” for requests to the root URL (/) .