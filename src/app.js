const express = require('express')
const app = express()
 
app.get('/', function (req, res) {
  console.log('Port is up and running!')
})
 
app.listen(3000)