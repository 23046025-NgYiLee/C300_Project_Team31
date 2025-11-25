const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const bcrypt = require('bcrypt');
bcrypt.hash('thispassword', 10).then(console.log);

bcrypt.hash('Staff123!', 10).then(console.loga);

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
  res.send('API Server is running');
});


// --------- User Registration ---------
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  // Check if email already exists
  connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
      'INSERT INTO user (email, password) VALUES (?, ?)',
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
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  connection.query(
    'SELECT * FROM user WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      if (!results || results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = results[0];

      // Compare password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
 
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }


      let role = 'staff';
      if (user.is_admin === 1 || user.is_admin === true) {
        role = 'admin';
      } else if (user.is_staff === 1 || user.is_staff === true) {
        role = 'staff';
      }

  
      return res.json({
        message: 'Login successful',
        userId: user.user_id || user.id,
        email: user.email,
        role
      });
    }
  );
});


//app.post('/login', (req, res) => {
  //const { email, password } = req.body;
  //if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  //connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    //if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    //if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    //const user = results[0];
    //const isMatch = await bcrypt.compare(password, user.password);
    //if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

  //  res.json({ message: 'Login successful', userId: user.id, email: user.email });
//  });
//});

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM user WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(404).json({ error: "Email not found" });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = new Date(Date.now() + 3600000); 

    // Store token in DB
    db.query(
      "UPDATE user SET reset_token = ?, reset_expires = ? WHERE email = ?",
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

// Handle password reset submission
app.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  db.query(
    "SELECT * FROM user WHERE reset_token = ? AND reset_expires > NOW()",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(400).json({ error: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE user SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?",
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



app.get('/api/stocks', (req, res) => {
  const sql = 'SELECT * FROM Inventory';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching stocks:", err);
      return res.status(500).json({ error: "Failed to fetch stocks" });
    }
    res.json(results);
  });
});


app.delete('/api/stocks/:id', (req, res) => {
  const itemId = req.params.id;
  const sql = 'DELETE FROM Inventory WHERE ItemID = ?';
  connection.query(sql, [itemId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete item' });
    res.json({ message: 'Item deleted' });
  });
});

app.post('/api/stocks', (req, res) => {

  const { name, quantity, brand, ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated } = req.body;

  const sql = 'INSERT INTO Inventory (ItemName, Quantity, Brand, ItemClass, ItemType, ItemCategory, Supplier, UnitPrice, DateAdded, LastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(sql, [name, quantity, brand,  ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated], (err, result) => {

    if (err) return res.status(500).json({ error: 'Error adding stock', details: err.message });
    
    res.status(201).json({ message: 'Stock added', id: result.insertId });
  });
});






// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
