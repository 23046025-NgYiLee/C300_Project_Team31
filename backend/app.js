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
const pool = mysql.createPool({
  host: process.env.DB_HOST || '8p0w1d.h.filess.io',
  user: process.env.DB_USER || 'inventory_management_thinkclay',
  password: process.env.DB_PASSWORD || '39804ddb7407e460450cfae23f25551de56c0c6e',
  database: process.env.DB_NAME || 'inventory_management_thinkclay',
  port: process.env.DB_PORT || 61002,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Table creation strings
const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_order_date (order_date)
  )
`;

const createOrderItemsTable = `
  CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id)
  )
`;

// Initialize tables
pool.query(createOrdersTable, (err) => {
  if (err) console.error('Error creating orders table:', err);
  else console.log('Orders table ready');
});

pool.query(createOrderItemsTable, (err) => {
  if (err) console.error('Error creating order_items table:', err);
  else console.log('Order items table ready');
});

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

// --------- User Login ---------
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
app.get('/api/stocks', (req, res) => {
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
  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch stocks" });
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
    pool.query(queries[key], (err, data) => {
      if (err) return res.status(500).json({ error: `Failed to fetch ${key}` });
      if (key === 'brands') results.brands = data.map(row => row.Brand);
      else if (key === 'classes') results.classes = data.map(row => row.ItemClass);
      else if (key === 'types') results.types = data.map(row => row.ItemType);
      completed++;
      if (completed === Object.keys(queries).length) res.json(results);
    });
  });
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

// Reports Endpoints
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

// Orders Endpoints
app.post('/api/orders', (req, res) => {
  const { customerEmail, customerName, items, totalAmount } = req.body;
  if (!customerEmail || !items || items.length === 0) return res.status(400).json({ error: 'Email and items are required' });
  const orderId = `ORD-${Date.now()}`;
  pool.query(
    'INSERT INTO orders (order_id, customer_name, customer_email, total_amount, order_date, status) VALUES (?, ?, ?, ?, NOW(), "Confirmed")',
    [orderId, customerName, customerEmail, totalAmount],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to create order' });
      const itemsValues = items.map(item => [orderId, item.ItemName || item.name, item.quantity, parseFloat(item.UnitPrice || item.price || 0)]);
      pool.query('INSERT INTO order_items (order_id, item_name, quantity, unit_price) VALUES ?', [itemsValues], (itemErr) => {
        if (itemErr) console.error('Error inserting order items:', itemErr);
        res.status(201).json({ message: 'Order created', orderId });
      });
    }
  );
});

app.get('/api/orders', (req, res) => {
  pool.query('SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON o.order_id = oi.order_id GROUP BY o.order_id ORDER BY o.order_date DESC', (err, results) => {
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
