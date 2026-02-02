const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in development
  credentials: true
};
app.use(cors(corsOptions));
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

// Create MySQL connection pool for better performance
// Note: Limited to 5 connections to stay within hosting limits
const pool = mysql.createPool({
  host: process.env.DB_HOST || '8p0w1d.h.filess.io',
  user: process.env.DB_USER || 'inventory_management_thinkclay',
  password: process.env.DB_PASSWORD || '39804ddb7407e460450cfae23f25551de56c0c6e',
  database: process.env.DB_NAME || 'inventory_management_thinkclay',
  port: process.env.DB_PORT || 61002,
  waitForConnections: true,
  connectionLimit: 4,
  queueLimit: 0
});

// Helper to handle DB queries with automatic retries for connection limits
const safeQuery = async (query, params = [], retries = 3) => {
  const promisePool = pool.promise();
  for (let i = 0; i < retries; i++) {
    try {
      const [results] = await promisePool.query(query, params);
      return results;
    } catch (err) {
      if ((err.code === 'ER_USER_LIMIT_REACHED' || err.code === 'PROTOCOL_CONNECTION_LOST') && i < retries - 1) {
        console.warn(`[DB] Limit hit. Retrying (${i + 1}/${retries}) in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
        continue;
      }
      console.error(`[DB] Query failed after ${i + 1} attempts:`, err.message);
      throw err;
    }
  }
};



app.get('/', (req, res) => {
  res.send('API Server is running');
});

// --------- User Registration ---------
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const name = email.split('@')[0];
  pool.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query(
      'INSERT INTO user (name, email, password, is_admin, is_supervisor, is_staff) VALUES (?, ?, ?, 0, 0, 1)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err.message });
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
      }
    );
  });
});

// --------- Customer Registration ---------
app.post('/api/customer/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password are required' });

  const promisePool = pool.promise();
  try {
    const [existing] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await promisePool.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const userId = userResult.insertId;

    // Create an associated Account entry for reports
    await promisePool.query(
      'INSERT INTO Accounts (accountName, accountType, user_id) VALUES (?, ?, ?)',
      [name, 'Customer', userId]
    );

    res.status(201).json({ message: 'Customer registered successfully', userId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// --------- Customer Login ---------
app.post('/api/customer/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const sql = `
    SELECT u.*, a.accountID, a.accountName 
    FROM users u 
    JOIN Accounts a ON u.id = a.user_id 
    WHERE u.email = ?
  `;

  pool.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (!results || results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    return res.json({
      message: 'Login successful',
      userId: user.id,
      email: user.email,
      name: user.accountName,
      accountID: user.accountID,
      role: 'customer'
    });
  });
});

// --------- Staff Login (Original) ---------
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  pool.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (!results || results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });
    let role = 'staff';
    if (user.is_admin) role = 'admin';
    else if (user.is_supervisor) role = 'supervisor';
    return res.json({
      message: 'Login successful',
      userId: user.user_id || user.id,
      email: user.email,
      role
    });
  });
});

// --------- Password Change ---------
app.post('/change-password', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  pool.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Email not found' });
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query(
      'UPDATE user SET password = ? WHERE email = ?',
      [hashedPassword, email],
      (updateErr, result) => {
        if (updateErr) return res.status(500).json({ error: 'Failed to update password', details: updateErr.message });
        res.json({ message: 'Password updated successfully' });
      }
    );
  });
});

// Get all stocks with optional search and filter parameters
app.get('/api/stocks', async (req, res) => {
  const { search, brand, class: itemClass, type, minQty, maxQty } = req.query;
  let sql = 'SELECT * FROM Inventory WHERE 1=1';
  const params = [];
  if (search) {
    sql += ' AND (ItemName LIKE ? OR Brand LIKE ? OR ItemClass LIKE ? OR ItemType LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  if (brand) { sql += ' AND Brand = ?'; params.push(brand); }
  if (itemClass) { sql += ' AND ItemClass = ?'; params.push(itemClass); }
  if (type) { sql += ' AND ItemType = ?'; params.push(type); }
  if (minQty) { sql += ' AND Quantity >= ?'; params.push(parseInt(minQty)); }
  if (maxQty) { sql += ' AND Quantity <= ?'; params.push(parseInt(maxQty)); }
  sql += ' ORDER BY ItemName ASC';

  try {
    const results = await safeQuery(sql, params);
    res.json(Array.isArray(results) ? results : []);
  } catch (err) {
    console.error('Error fetching stocks:', err.message);
    res.status(500).json({ error: "Failed to fetch stocks", details: err.message });
  }
});

// Get unique filter values for dropdowns
app.get('/api/stocks/filters/values', async (req, res) => {
  try {
    const brandsData = await safeQuery('SELECT DISTINCT Brand FROM Inventory WHERE Brand IS NOT NULL AND Brand != "" ORDER BY Brand ASC');
    const classesData = await safeQuery('SELECT DISTINCT ItemClass FROM Inventory WHERE ItemClass IS NOT NULL AND ItemClass != "" ORDER BY ItemClass ASC');
    const typesData = await safeQuery('SELECT DISTINCT ItemType FROM Inventory WHERE ItemType IS NOT NULL AND ItemType != "" ORDER BY ItemType ASC');

    res.json({
      brands: (brandsData || []).map(row => row.Brand),
      classes: (classesData || []).map(row => row.ItemClass),
      types: (typesData || []).map(row => row.ItemType)
    });
  } catch (err) {
    console.error('Error fetching filter values:', err.message);
    res.status(500).json({
      error: "Failed to fetch filter values",
      details: err.message,
      code: err.code
    });
  }
});

// Get single stock item by ID
app.get('/api/stocks/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM Inventory WHERE ItemID = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch stock item" });
    if (results.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(results[0]);
  });
});

app.delete('/api/stocks/:id', (req, res) => {
  pool.query('DELETE FROM Inventory WHERE ItemID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete item' });
    res.json({ message: 'Item deleted' });
  });
});

app.post('/api/stocks', upload.single('image'), (req, res) => {
  const { name, quantity, brand, ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated } = req.body;
  const imagePath = req.file ? req.file.filename : 'placeholder.png';
  const sql = 'INSERT INTO Inventory (ItemName, Quantity, Brand, ItemClass, ItemType, ItemCategory, Supplier, UnitPrice, DateAdded, LastUpdated, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  pool.query(sql, [name, quantity, brand, ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated, imagePath], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error adding stock', details: err.message });
    res.status(201).json({ message: 'Stock added', id: result.insertId, imagePath: imagePath });
  });
});

app.put('/api/stocks/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, quantity, brand, ItemClass, type, category, supplier, unitPrice } = req.body;
  const imagePath = req.file ? req.file.filename : req.body.imagePath || 'placeholder.png';
  const sql = `UPDATE Inventory SET ItemName = ?, Quantity = ?, Brand = ?, ItemClass = ?, ItemType = ?, ItemCategory = ?, Supplier = ?, UnitPrice = ?, ImagePath = ?, LastUpdated = NOW() WHERE ItemID = ?`;
  pool.query(sql, [name, quantity, brand, ItemClass, type, category, supplier, unitPrice, imagePath, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating stock', details: err.message });
    res.json({ message: 'Stock updated successfully', id: id, imagePath: imagePath });
  });
});

// Record a new movement
app.post('/api/movements', (req, res) => {
  const { itemId, movementType, fromLocation, toLocation, quantity, movedBy, notes, productionNumber } = req.body;
  if (!itemId || !movementType || !quantity) return res.status(400).json({ error: 'ItemID, movement type, and quantity are required' });
  pool.query('SELECT * FROM Inventory WHERE ItemID = ?', [itemId], (err, items) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (items.length === 0) return res.status(404).json({ error: 'Item not found' });
    const item = items[0];
    const currentLocation = item.Location || 'Zone A - Arrival';
    if (movementType === 'Shipment' && quantity > item.Quantity) return res.status(400).json({ error: 'Insufficient quantity for shipment' });
    const toLoc = movementType === 'Shipment' ? 'Customer' : toLocation;
    pool.query(
      'INSERT INTO MovementHistory (ItemID, MovementType, FromLocation, ToLocation, Quantity, ProductionNumber, MovedBy, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [itemId, movementType, currentLocation, toLoc, quantity, productionNumber || null, movedBy || 'System', notes || ''],
      (insertErr, insertResult) => {
        if (insertErr) return res.status(500).json({ error: 'Failed to record movement', details: insertErr.message });
        let updateSql = movementType === 'Transfer'
          ? 'UPDATE Inventory SET Location = ?, LastUpdated = NOW() WHERE ItemID = ?'
          : 'UPDATE Inventory SET Quantity = Quantity - ?, LastUpdated = NOW() WHERE ItemID = ?';
        let updateParams = movementType === 'Transfer' ? [toLocation, itemId] : [quantity, itemId];
        pool.query(updateSql, updateParams, (updateErr) => {
          if (updateErr) return res.status(500).json({ error: 'Failed to update inventory', details: updateErr.message });
          res.status(201).json({ message: 'Movement recorded successfully', movementId: insertResult.insertId });
        });
      }
    );
  });
});

app.get('/api/movements/:itemId', (req, res) => {
  const sql = `SELECT m.*, i.ItemName, i.Brand FROM MovementHistory m JOIN Inventory i ON m.ItemID = i.ItemID WHERE m.ItemID = ? ORDER BY m.MovementDate DESC`;
  pool.query(sql, [req.params.itemId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch movement history', details: err.message });
    res.json(results);
  });
});

app.get('/api/movements', (req, res) => {
  const sql = `SELECT m.*, i.ItemName, i.Brand, i.ItemClass FROM MovementHistory m JOIN Inventory i ON m.ItemID = i.ItemID ORDER BY m.MovementDate DESC LIMIT 100`;
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch movements', details: err.message });
    res.json(results);
  });
});

app.post('/api/user', (req, res) => {
  const { name, email, password, is_staff, is_supervisor } = req.body;
  pool.query('INSERT INTO user (name, email, password, is_staff, is_supervisor) VALUES (?, ?, ?, ?, ?)', [name, email, password, is_staff, is_supervisor], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error adding staff', details: err.message });
    res.status(201).json({ message: 'staff added', id: result.insertId });
  });
});

// Consolidated Report Dashboard Summary
app.get('/api/reports/summary', async (req, res) => {
  const data = {};
  const queries = {
    accountsReports: 'SELECT * FROM Accounts_Reports ORDER BY reportDate DESC',
    productReports: 'SELECT * FROM Product_Reports ORDER BY reportDate DESC',
    inventoryReports: 'SELECT * FROM Inventory_Reports ORDER BY reportDate DESC',
    transactionReports: 'SELECT * FROM Transaction_Reports ORDER BY reportDate DESC',
    transactions: 'SELECT * FROM Transactions ORDER BY transactionDate DESC',
    customerOrders: 'SELECT * FROM orders ORDER BY order_date DESC',
    stocks: 'SELECT * FROM Inventory ORDER BY ItemName ASC'
  };

  try {
    // Run queries sequentially using safeQuery for resilience
    for (const key of Object.keys(queries)) {
      data[key] = await safeQuery(queries[key]);
    }
    res.json(data);
  } catch (err) {
    console.error('Error fetching reports summary:', err.message);
    res.status(500).json({ error: "Failed to fetch reports summary", details: err.message });
  }
});

app.get('/api/accounts_reports', (req, res) => {
  pool.query('SELECT * FROM Accounts_Reports ORDER BY reportDate DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch accounts reports' });
    res.json(results);
  });
});
app.get('/api/product_reports', (req, res) => {
  pool.query('SELECT * FROM Product_Reports ORDER BY reportDate DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch product reports' });
    res.json(results);
  });
});
app.get('/api/inventory_reports', (req, res) => {
  pool.query('SELECT * FROM Inventory_Reports ORDER BY reportDate DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch inventory reports' });
    res.json(results);
  });
});
app.get('/api/transaction_reports', (req, res) => {
  pool.query('SELECT * FROM Transaction_Reports ORDER BY reportDate DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transaction reports' });
    res.json(results);
  });
});
app.get('/api/transactions', (req, res) => {
  pool.query('SELECT * FROM Transactions ORDER BY transactionDate DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transactions' });
    res.json(results);
  });
});

// Transaction CRUD Operations
app.post('/api/transactions', (req, res) => {
  const { accountID, amount, transactionDate, description } = req.body;
  if (!accountID || !amount) {
    return res.status(400).json({ error: 'Account ID and amount are required' });
  }
  const sql = 'INSERT INTO Transactions (accountID, amount, transactionDate, description) VALUES (?, ?, ?, ?)';
  const date = transactionDate || new Date();
  pool.query(sql, [accountID, amount, date, description || ''], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create transaction', details: err.message });
    res.status(201).json({ message: 'Transaction created', transactionID: result.insertId });
  });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { accountID, amount, transactionDate, description } = req.body;
  const sql = 'UPDATE Transactions SET accountID = ?, amount = ?, transactionDate = ?, description = ? WHERE transactionID = ?';
  pool.query(sql, [accountID, amount, transactionDate, description, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update transaction', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction updated successfully' });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM Transactions WHERE transactionID = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  });
});

// Stock Taking Finalization
app.post('/api/stocktaking/finalize', async (req, res) => {
  const { adjustments } = req.body;
  if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
    return res.status(400).json({ error: 'Adjustments array is required' });
  }

  let errors = [];
  const promisePool = pool.promise();

  try {
    // Process adjustments sequentially to avoid connection limit issues
    for (const adjustment of adjustments) {
      const { ItemID, NewQuantity } = adjustment;
      try {
        await promisePool.query(
          'UPDATE Inventory SET Quantity = ?, LastUpdated = NOW() WHERE ItemID = ?',
          [NewQuantity, ItemID]
        );
      } catch (err) {
        errors.push({ ItemID, error: err.message });
      }
    }

    if (errors.length > 0) {
      return res.status(500).json({
        error: 'Some adjustments failed',
        details: errors,
        successful: adjustments.length - errors.length
      });
    }

    res.json({
      message: 'Stock taking finalized successfully',
      adjustedItems: adjustments.length
    });
  } catch (err) {
    console.error('Error in stocktaking finalize:', err);
    res.status(500).json({ error: 'Internal server error during finalization' });
  }
});

// Brand/Class/Type Reference Table APIs
// Brands CRUD
app.get('/api/brands', async (req, res) => {
  try {
    const results = await safeQuery('SELECT * FROM Brands ORDER BY BrandName ASC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

app.post('/api/brands', (req, res) => {
  const { BrandName, Description } = req.body;
  if (!BrandName) return res.status(400).json({ error: 'Brand name is required' });
  pool.query('INSERT INTO Brands (BrandName, Description) VALUES (?, ?)', [BrandName, Description || ''], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Brand already exists' });
      return res.status(500).json({ error: 'Failed to create brand', details: err.message });
    }
    res.status(201).json({ message: 'Brand created', BrandID: result.insertId });
  });
});

app.put('/api/brands/:id', (req, res) => {
  const { id } = req.params;
  const { BrandName, Description } = req.body;
  pool.query('UPDATE Brands SET BrandName = ?, Description = ? WHERE BrandID = ?', [BrandName, Description, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update brand', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand updated successfully' });
  });
});

app.delete('/api/brands/:id', (req, res) => {
  pool.query('DELETE FROM Brands WHERE BrandID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete brand', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  });
});

// Classes CRUD
app.get('/api/classes', async (req, res) => {
  try {
    const results = await safeQuery('SELECT * FROM Classes ORDER BY ClassName ASC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.post('/api/classes', (req, res) => {
  const { ClassName, Description } = req.body;
  if (!ClassName) return res.status(400).json({ error: 'Class name is required' });
  pool.query('INSERT INTO Classes (ClassName, Description) VALUES (?, ?)', [ClassName, Description || ''], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Class already exists' });
      return res.status(500).json({ error: 'Failed to create class', details: err.message });
    }
    res.status(201).json({ message: 'Class created', ClassID: result.insertId });
  });
});

app.put('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const { ClassName, Description } = req.body;
  pool.query('UPDATE Classes SET ClassName = ?, Description = ? WHERE ClassID = ?', [ClassName, Description, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update class', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Class not found' });
    res.json({ message: 'Class updated successfully' });
  });
});

app.delete('/api/classes/:id', (req, res) => {
  pool.query('DELETE FROM Classes WHERE ClassID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete class', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  });
});

// Types CRUD
app.get('/api/types', async (req, res) => {
  try {
    const results = await safeQuery('SELECT * FROM Types ORDER BY TypeName ASC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

app.post('/api/types', (req, res) => {
  const { TypeName, Description } = req.body;
  if (!TypeName) return res.status(400).json({ error: 'Type name is required' });
  pool.query('INSERT INTO Types (TypeName, Description) VALUES (?, ?)', [TypeName, Description || ''], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Type already exists' });
      return res.status(500).json({ error: 'Failed to create type', details: err.message });
    }
    res.status(201).json({ message: 'Type created', TypeID: result.insertId });
  });
});

app.put('/api/types/:id', (req, res) => {
  const { id } = req.params;
  const { TypeName, Description } = req.body;
  pool.query('UPDATE Types SET TypeName = ?, Description = ? WHERE TypeID = ?', [TypeName, Description, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update type', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Type not found' });
    res.json({ message: 'Type updated successfully' });
  });
});

app.delete('/api/types/:id', (req, res) => {
  pool.query('DELETE FROM Types WHERE TypeID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete type', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Type not found' });
    res.json({ message: 'Type deleted successfully' });
  });
});

// Orders Endpoints
// Orders Endpoints
app.post('/api/orders', async (req, res) => {
  const { customerEmail, customerName, items, totalAmount, accountID } = req.body;
  if (!customerEmail || !items || items.length === 0) return res.status(400).json({ error: 'Email and items are required' });

  const orderId = `ORD-${Date.now()}`;
  const promisePool = pool.promise();
  let connection;

  try {
    connection = await promisePool.getConnection();
    await connection.beginTransaction();

    // 0. Determine effectiveAccountID
    let effectiveAccountID = accountID;
    if (!effectiveAccountID) {
      const [accs] = await connection.query('SELECT accountID FROM Accounts a JOIN users u ON a.user_id = u.id WHERE u.email = ?', [customerEmail]);
      if (accs.length > 0) {
        effectiveAccountID = accs[0].accountID;
      } else {
        const [anyAcc] = await connection.query('SELECT accountID FROM Accounts LIMIT 1');
        effectiveAccountID = anyAcc.length > 0 ? anyAcc[0].accountID : null;
      }
    }

    // 1. Create the main order record
    await connection.query(
      'INSERT INTO orders (order_id, customer_name, customer_email, total_amount, order_date, status) VALUES (?, ?, ?, ?, NOW(), "Confirmed")',
      [orderId, customerName, customerEmail, totalAmount]
    );

    // 2. Insert order items
    const itemsValues = items.map(item => [orderId, item.ItemName || item.name, item.quantity, parseFloat(item.UnitPrice || item.price || 0)]);
    await connection.query('INSERT INTO order_items (order_id, item_name, quantity, unit_price) VALUES ?', [itemsValues]);

    // 3. Process each item for inventory and reports
    for (const item of items) {
      const itemName = item.ItemName || item.name;
      const quantity = item.quantity;
      const itemId = item.ItemID;

      let actualItemId = itemId;
      if (!actualItemId) {
        const [invItems] = await connection.query('SELECT ItemID FROM Inventory WHERE ItemName = ?', [itemName]);
        if (invItems.length > 0) actualItemId = invItems[0].ItemID;
      }

      if (actualItemId) {
        // B. Deduct Inventory
        await connection.query(
          'UPDATE Inventory SET Quantity = Quantity - ?, LastUpdated = NOW() WHERE ItemID = ?',
          [quantity, actualItemId]
        );

        // C. Record Movement
        await connection.query(
          'INSERT INTO MovementHistory (ItemID, MovementType, FromLocation, ToLocation, Quantity, MovedBy, Notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [actualItemId, 'Shipment', 'Warehouse', 'Customer', quantity, 'Customer Checkout', `Order ${orderId}`]
        );

        // D. Update Inventory Reports
        await connection.query(
          'INSERT INTO Inventory_Reports (inventoryID, reportDate, reportDetails) VALUES (?, NOW(), ?)',
          [actualItemId, `Inventory deduction for order ${orderId}. Quantity: ${quantity}`]
        );
      }
    }

    // 4. Record Financial Transaction (Only if we have a valid accountID)
    if (effectiveAccountID) {
      // Use ProductionNumber for description as schema lacks 'description' column
      const [transResult] = await connection.query(
        'INSERT INTO Transactions (accountID, amount, transactionDate, ProductionNumber) VALUES (?, ?, NOW(), ?)',
        [effectiveAccountID, totalAmount, `Order ${orderId}`]
      );
      const transactionId = transResult.insertId;

      // 5. Update Accounts Reports (Revenue)
      // No 'amount' column in Accounts_Reports.
      await connection.query(
        'INSERT INTO Accounts_Reports (accountID, reportDate, reportDetails) VALUES (?, NOW(), ?)',
        [effectiveAccountID, `Revenue from order ${orderId}. Amount: $${totalAmount}`]
      );

      // 6. Update Transaction Reports
      await connection.query(
        'INSERT INTO Transaction_Reports (transactionID, reportDate, reportDetails) VALUES (?, NOW(), ?)',
        [transactionId, `Analysis for order ${orderId}. Total revenue: $${totalAmount}`]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Order processed successfully', orderId });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Order processing error:', err);
    res.status(500).json({
      error: 'Failed to process order completely',
      message: err.message,
      code: err.code
    });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  let sql = `
    SELECT o.*, 
           COUNT(oi.id) as item_count,
           GROUP_CONCAT(CONCAT(oi.item_name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
    FROM orders o 
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
  `;
  let params = [];

  if (email) {
    sql += ' WHERE o.customer_email = ?';
    params.push(email);
  }

  sql += ' GROUP BY o.order_id ORDER BY o.order_date DESC';

  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders' });
    res.json(results);
  });
});

app.get('/api/orders/:orderId', (req, res) => {
  pool.query('SELECT * FROM orders WHERE order_id = ?', [req.params.orderId], (err, orders) => {
    if (err || orders.length === 0) return res.status(404).json({ error: 'Order not found' });
    pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.orderId], (err, items) => {
      res.json({ ...orders[0], items });
    });
  });
});

// ========== REPORT GENERATION ENDPOINTS ==========

// Generate individual item report
app.get('/api/reports/item/:itemId', (req, res) => {
  const { itemId } = req.params;
  const sql = `
    SELECT 
      i.*,
      COUNT(m.MovementID) as total_movements,
      SUM(CASE WHEN m.MovementType = 'Shipment' THEN m.Quantity ELSE 0 END) as total_shipped,
      SUM(CASE WHEN m.MovementType = 'Transfer' THEN m.Quantity ELSE 0 END) as total_transferred
    FROM Inventory i
    LEFT JOIN MovementHistory m ON i.ItemID = m.ItemID
    WHERE i.ItemID = ?
    GROUP BY i.ItemID
  `;
  pool.query(sql, [itemId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to generate item report', details: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Item not found' });

    pool.query('SELECT * FROM MovementHistory WHERE ItemID = ? ORDER BY MovementDate DESC LIMIT 50', [itemId], (movErr, movements) => {
      if (movErr) return res.status(500).json({ error: 'Failed to fetch movement history' });
      res.json({
        item: results[0],
        movements: movements,
        generated_at: new Date().toISOString()
      });
    });
  });
});

// Generate overall inventory report
app.get('/api/reports/inventory/overall', (req, res) => {
  const sql = `
    SELECT 
      i.*,
      COALESCE(SUM(m.Quantity), 0) as total_movements,
      COALESCE(COUNT(m.MovementID), 0) as movement_count
    FROM Inventory i
    LEFT JOIN MovementHistory m ON i.ItemID = m.ItemID
    GROUP BY i.ItemID
    ORDER BY i.ItemName ASC
  `;
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to generate overall report', details: err.message });

    const summary = {
      total_items: results.length,
      total_quantity: results.reduce((sum, item) => sum + (item.Quantity || 0), 0),
      total_value: results.reduce((sum, item) => sum + ((item.Quantity || 0) * (item.UnitPrice || 0)), 0),
      low_stock_items: results.filter(item => item.Quantity < 10).length,
      out_of_stock_items: results.filter(item => item.Quantity === 0).length,
      by_category: {}
    };

    results.forEach(item => {
      const category = item.ItemCategory || 'Uncategorized';
      if (!summary.by_category[category]) {
        summary.by_category[category] = { count: 0, total_quantity: 0, total_value: 0 };
      }
      summary.by_category[category].count++;
      summary.by_category[category].total_quantity += item.Quantity || 0;
      summary.by_category[category].total_value += (item.Quantity || 0) * (item.UnitPrice || 0);
    });

    res.json({ summary, items: results, generated_at: new Date().toISOString() });
  });
});

// Generate CSV export for inventory
app.get('/api/reports/inventory/csv', (req, res) => {
  pool.query('SELECT * FROM Inventory ORDER BY ItemName ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to generate CSV', details: err.message });
    if (results.length === 0) return res.status(404).send('No data available');

    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => {
      return Object.values(row).map(value => {
        if (value === null) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${Date.now()}.csv"`);
    res.send(csv);
  });
});

// Generate individual item CSV
app.get('/api/reports/item/:itemId/csv', (req, res) => {
  const { itemId } = req.params;
  const sql = `
    SELECT 
      i.*, m.MovementType, m.FromLocation, m.ToLocation, m.Quantity as MovementQuantity, 
      m.MovedBy, m.MovementDate, m.Notes
    FROM Inventory i
    LEFT JOIN MovementHistory m ON i.ItemID = m.ItemID
    WHERE i.ItemID = ?
    ORDER BY m.MovementDate DESC
  `;
  pool.query(sql, [itemId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to generate CSV', details: err.message });
    if (results.length === 0) return res.status(404).send('Item not found');

    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => {
      return Object.values(row).map(value => {
        if (value === null) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const itemName = results[0].ItemName.replace(/[^a-z0-9]/gi, '_');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${itemName}_report_${Date.now()}.csv"`);
    res.send(csv);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
