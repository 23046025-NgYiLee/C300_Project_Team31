const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))


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

// --------- User Registration ---------
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  // Check if email already exists
  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error('INSERT error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
      }
    );
  });
});

// --------- User Login ---------
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ message: 'Login successful', userId: user.id, email: user.email });
  });
});

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "Email not found" });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = new Date(Date.now() + 3600000); // valid for 1 hour

    // Store token in DB
    db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expireTime, email],
      (updateErr) => {
        if (updateErr)
          return res.status(500).json({ error: "Failed to save token" });

        // Send email
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
          from: "youremail@outlook.com",
          to: email,
          subject: "Password Reset Request",
          html: `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
          `,
        };

        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr)
            return res.status(500).json({ error: "Failed to send email" });

          res.json({ message: "Password reset link sent to your email." });
        });
      }
    );
  });
});

// ✅ Step 2: Handle password reset submission
app.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(400).json({ error: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?",
        [hashedPassword, token],
        (updateErr) => {
          if (updateErr)
            return res.status(500).json({ error: "Failed to update password" });
          res.json({ message: "Password updated successfully." });
        }
      );
    }
  );
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
