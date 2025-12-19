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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})
const upload = multer({ storage: storage });

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



// Get all stocks with optional search and filter parameters
app.get('/api/stocks', (req, res) => {
  const { search, brand, class: itemClass, type, minQty, maxQty } = req.query;

  let sql = 'SELECT * FROM Inventory WHERE 1=1';
  const params = [];

  // Search filter - searches across name, brand, class, and type
  if (search) {
    sql += ' AND (ItemName LIKE ? OR Brand LIKE ? OR ItemClass LIKE ? OR ItemType LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  // Brand filter
  if (brand) {
    sql += ' AND Brand = ?';
    params.push(brand);
  }

  // Class filter
  if (itemClass) {
    sql += ' AND ItemClass = ?';
    params.push(itemClass);
  }

  // Type filter
  if (type) {
    sql += ' AND ItemType = ?';
    params.push(type);
  }

  // Minimum quantity filter
  if (minQty) {
    sql += ' AND Quantity >= ?';
    params.push(parseInt(minQty));
  }

  // Maximum quantity filter
  if (maxQty) {
    sql += ' AND Quantity <= ?';
    params.push(parseInt(maxQty));
  }

  sql += ' ORDER BY ItemName ASC';

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching stocks:", err);
      return res.status(500).json({ error: "Failed to fetch stocks" });
    }
    res.json(results);
  });
});

// Get unique filter values for dropdowns
app.get('/api/stocks/filters/values', (req, res) => {
  const queries = {
    brands: 'SELECT DISTINCT Brand FROM Inventory WHERE Brand IS NOT NULL AND Brand != "" ORDER BY Brand ASC',
    classes: 'SELECT DISTINCT ItemClass FROM Inventory WHERE ItemClass IS NOT NULL AND ItemClass != "" ORDER BY ItemClass ASC',
    types: 'SELECT DISTINCT ItemType FROM Inventory WHERE ItemType IS NOT NULL AND ItemType != "" ORDER BY ItemType ASC'
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    connection.query(queries[key], (err, data) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        return res.status(500).json({ error: `Failed to fetch ${key}` });
      }

      // Extract values from result objects
      if (key === 'brands') {
        results.brands = data.map(row => row.Brand);
      } else if (key === 'classes') {
        results.classes = data.map(row => row.ItemClass);
      } else if (key === 'types') {
        results.types = data.map(row => row.ItemType);
      }

      completed++;
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
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

  connection.query(sql, [name, quantity, brand, ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated], (err, result) => {

    if (err) return res.status(500).json({ error: 'Error adding stock', details: err.message });

    res.status(201).json({ message: 'Stock added', id: result.insertId });
  });
});


// ========== MOVEMENT TRACKING API ENDPOINTS ==========

// Record a new movement (Transfer or Shipment)
app.post('/api/movements', (req, res) => {
  const { itemId, movementType, fromLocation, toLocation, quantity, movedBy, notes } = req.body;

  // Validate required fields
  if (!itemId || !movementType || !quantity) {
    return res.status(400).json({ error: 'ItemID, movement type, and quantity are required' });
  }

  // First, get the current item details
  connection.query('SELECT * FROM Inventory WHERE ItemID = ?', [itemId], (err, items) => {
    if (err) {
      console.error('Error fetching item:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[0];
    const currentLocation = item.Location || 'Zone A - Arrival';

    // Validate quantity for shipments
    if (movementType === 'Shipment' && quantity > item.Quantity) {
      return res.status(400).json({ error: 'Insufficient quantity for shipment' });
    }

    // Prepare movement record
    const movementData = {
      fromLocation: currentLocation,
      toLocation: movementType === 'Shipment' ? 'Customer' : toLocation,
    };

    // Insert movement history record
    const insertMovementSql = `
      INSERT INTO MovementHistory 
      (ItemID, MovementType, FromLocation, ToLocation, Quantity, MovedBy, Notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      insertMovementSql,
      [itemId, movementType, movementData.fromLocation, movementData.toLocation, quantity, movedBy || 'System', notes || ''],
      (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error recording movement:', insertErr);
          return res.status(500).json({ error: 'Failed to record movement', details: insertErr.message });
        }

        // Update the inventory based on movement type
        let updateSql;
        let updateParams;

        if (movementType === 'Transfer') {
          // Update location for transfer
          updateSql = 'UPDATE Inventory SET Location = ?, LastUpdated = NOW() WHERE ItemID = ?';
          updateParams = [toLocation, itemId];
        } else if (movementType === 'Shipment') {
          // Reduce quantity for shipment
          updateSql = 'UPDATE Inventory SET Quantity = Quantity - ?, LastUpdated = NOW() WHERE ItemID = ?';
          updateParams = [quantity, itemId];
        }

        connection.query(updateSql, updateParams, (updateErr) => {
          if (updateErr) {
            console.error('Error updating inventory:', updateErr);
            return res.status(500).json({ error: 'Failed to update inventory', details: updateErr.message });
          }

          res.status(201).json({
            message: 'Movement recorded successfully',
            movementId: insertResult.insertId,
            type: movementType,
            itemId: itemId
          });
        });
      }
    );
  });
});

// Get movement history for a specific item
app.get('/api/movements/:itemId', (req, res) => {
  const { itemId } = req.params;

  const sql = `
    SELECT 
      m.*,
      i.ItemName,
      i.Brand
    FROM MovementHistory m
    JOIN Inventory i ON m.ItemID = i.ItemID
    WHERE m.ItemID = ?
    ORDER BY m.MovementDate DESC
  `;

  connection.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error('Error fetching movement history:', err);
      return res.status(500).json({ error: 'Failed to fetch movement history', details: err.message });
    }
    res.json(results);
  });
});

// Get all movement history (optional - for reports)
app.get('/api/movements', (req, res) => {
  const sql = `
    SELECT 
      m.*,
      i.ItemName,
      i.Brand,
      i.ItemClass
    FROM MovementHistory m
    JOIN Inventory i ON m.ItemID = i.ItemID
    ORDER BY m.MovementDate DESC
    LIMIT 100
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching movements:', err);
      return res.status(500).json({ error: 'Failed to fetch movements', details: err.message });
    }
    res.json(results);
  });
});


app.post('/api/user', (req, res) => {

  const { name, email, password, is_staff, is_supervisor } = req.body;

  const sql = 'INSERT INTO user (name, email ,password , is_staff, is_supervisor) VALUES (?, ?, ?, ?, ?)';

  connection.query(sql, [name, email, password, is_staff, is_supervisor], (err, result) => {

    if (err) return res.status(500).json({ error: 'Error adding staff', details: err.message });

    res.status(201).json({ message: 'staff added', id: result.insertId });
  });
});


// ========== REPORTS API ENDPOINTS ==========

// Get Accounts Reports
app.get('/api/accounts_reports', (req, res) => {
  const sql = 'SELECT * FROM Accounts_Reports ORDER BY reportDate DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching accounts reports:', err);
      return res.status(500).json({ error: 'Failed to fetch accounts reports', details: err.message });
    }
    res.json(results);
  });
});

// Get Product Reports  
app.get('/api/product_reports', (req, res) => {
  const sql = 'SELECT * FROM Product_Reports ORDER BY reportDate DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching product reports:', err);
      return res.status(500).json({ error: 'Failed to fetch product reports', details: err.message });
    }
    res.json(results);
  });
});

// Get Inventory Reports
app.get('/api/inventory_reports', (req, res) => {
  const sql = 'SELECT * FROM Inventory_Reports ORDER BY reportDate DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching inventory reports:', err);
      return res.status(500).json({ error: 'Failed to fetch inventory reports', details: err.message });
    }
    res.json(results);
  });
});

// Get Transaction Reports
app.get('/api/transaction_reports', (req, res) => {
  const sql = 'SELECT * FROM Transaction_Reports ORDER BY reportDate DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching transaction reports:', err);
      return res.status(500).json({ error: 'Failed to fetch transaction reports', details: err.message });
    }
    res.json(results);
  });
});

// Get Transactions
app.get('/api/transactions', (req, res) => {
  const sql = 'SELECT * FROM Transactions ORDER BY transactionDate DESC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
    res.json(results);
  });
});







// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
