const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// View engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));


app.use(express.static('public'));
const storage= multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null,'public/images');
    },
    filename:(req,file, cb)=>{
        cb(null,file.originalname);
    }
})
const upload= multer({storage:storage});

//create a database
// Create MySQL connection
const connection = mysql.createConnection({
    host: '8p0w1d.h.filess.io',
    user: 'inventory_management_thinkclay',
    password: '39804ddb7407e460450cfae23f25551de56c0c6e',
    database: 'inventory_management_thinkclay',
    port: 61002
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
  res.render('index');
});

// List all flowers
app.get('/List', (req, res) => {
  const sql = 'SELECT * FROM flowers';
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).send('Error retrieving products');
    res.render('List', { flowers: results });
  });
});

// Cart page
app.get('/cart', (req, res) => {
  const sql = 'SELECT * FROM cart';
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).send('Error retrieving cart');
    res.render('cart', { cart: results });
  });
});

// Add flower page
app.get('/addflower', (req, res) => {
  res.render('addflower');
});

// Add flower POST
app.post('/addflower', upload.single('image'), (req, res) => {
  const { name, quantity, price } = req.body;
  const image = req.file ? req.file.filename : null;
  const sql = 'INSERT INTO flowers (name, quantity, price, image) VALUES (?, ?, ?, ?)';
  pool.query(sql, [name, quantity, price, image], (err) => {
    if (err) return res.status(500).send('Error adding flower');
    res.redirect('/List');
  });
});

// Edit flower page
app.get('/editflower/:id', (req, res) => {
  const sql = 'SELECT * FROM flowers WHERE Flowerid = ?';
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Error retrieving flower');
    if (results.length === 0) return res.status(404).send('Flower not found');
    res.render('editflower', { flower: results[0] });
  });
});

// Edit flower POST
app.post('/editflower/:id', upload.single('image'), (req, res) => {
  const { name, quantity, price } = req.body;
  let image = req.body.currentImage || null;
  if (req.file) image = req.file.filename;

  const sql = 'UPDATE flowers SET name = ?, quantity = ?, price = ?, image = ? WHERE Flowerid = ?';
  pool.query(sql, [name, quantity, price, image, req.params.id], (err) => {
    if (err) return res.status(500).send('Error updating flower');
    res.redirect('/List');
  });
});

// Delete flower
app.get('/deleteFlower/:id', (req, res) => {
  const sql = 'DELETE FROM flowers WHERE Flowerid = ?';
  pool.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send('Error deleting flower');
    res.redirect('/List');
  });
});

// Delete flower from cart
app.get('/deleteFlowercart/:id', (req, res) => {
  const sql = 'DELETE FROM cart WHERE Cartid = ?';
  pool.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send('Error deleting cart item');
    res.redirect('/cart');
  });
});

// Flower detail page
app.get('/detail/:id', (req, res) => {
  const sql = 'SELECT * FROM flowers WHERE Flowerid = ?';
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send('Error retrieving flower');
    if (results.length === 0) return res.status(404).send('Flower not found');
    res.render('detail', { Flower: results[0] });
  });
});

// Add flower to cart
app.post(['/detail/:id/addtocart', '/List/:id/addtocart'], (req, res) => {
  const Flowerid = req.params.id;
  const { quantity } = req.body;

  const selectSql = 'SELECT name, price, image, quantity as stock FROM flowers WHERE Flowerid = ?';
  pool.query(selectSql, [Flowerid], (err, results) => {
    if (err) return res.status(500).send('Error retrieving flower');
    if (results.length === 0) return res.status(404).send('Flower not found');

    const { name, image, price, stock } = results[0];
    const qty = quantity ? parseInt(quantity) : stock; // use provided quantity or stock

    const insertSql = 'INSERT INTO cart (name, image, price, quantity) VALUES (?, ?, ?, ?)';
    pool.query(insertSql, [name, image, price, qty], (err) => {
      if (err) return res.status(500).send('Error adding to cart');
      res.redirect('/cart'); // redirect to cart
    });
  });
});

// Search flower by name
app.get('/search', (req, res) => {
  const { search } = req.query;
  const sql = 'SELECT * FROM flowers WHERE name LIKE ? COLLATE utf8mb4_general_ci';
  pool.query(sql, [`%${search}%`], (err, results) => {
    if (err) return res.status(500).send('Error searching for flowers');
    if (results.length > 0) res.redirect(`/detail/${results[0].Flowerid}`);
    else res.send('No flower found with that name');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
