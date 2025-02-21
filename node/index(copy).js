const express = require('express');
const app = express();
const cors = require('cors');  

// Middleware
app.use(express.json()); //req.body
app.use(cors());

// routes
// register and login routes
app.use('/auth', require('./routes/jwtAuth'));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
