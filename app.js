const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');

const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const api = process.env.API_URL;

app.use(cors());
app.options('*', cors());

//Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//Routers
app.use(`${api}/products`, require('./routers/products'));
app.use(`${api}/categories`, require('./routers/categories'));
app.use(`${api}/users`, require('./routers/users'));
app.use(`${api}/orders`, require('./routers/orders'));



mongoose.connect(process.env.DB_CONN, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    dbName: 'e-shop'
})
.then(() => {
    console.log('Database ready')
})
.catch((err) => {
    console.log(err);
});

//Development
app.listen(3000, () => {
   console.log('Server is running http://localhost:3000'); 
});

var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port;
    console.log(`Server is running PORT: ${ port }`); 
})

