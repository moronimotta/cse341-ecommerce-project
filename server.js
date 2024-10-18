const express = require('express');
const app = express();
const mongodb = require('./data/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cartRoutes = require('./routes/cart');


const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

app.use(bodyParser.json());

app.use('/', require('./routes/index'));
app.use((req, res, next) => {
  res.status(404).json({ message: 'Page not found.' });
});

// Cart routes
app.use(express.json());
app.use('/api/cart', cartRoutes);

app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ message: 'An internal error occurred!' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
  } else {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
});
