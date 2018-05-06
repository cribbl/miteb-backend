const express = require('express');

app = express()

app.get('/', function(req, res) {
      res.send('Hello world!');
});

app.listen(3002);
console.log('running');