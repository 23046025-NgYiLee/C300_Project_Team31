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

  // Extract name from email (before @ symbol)
  const name = email.split('@')[0];

  // Check if email already exists
  connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert with name and default role flags
    connection.query(
      'INSERT INTO user (name, email, password, is_admin, is_supervisor, is_staff) VALUES (?, ?, ?, 0, 0, 1)',
      [name, email, hashedPassword],
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

// --------- Password Change ---------
app.post('/change-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check if user exists
  connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in database
    connection.query(
      'UPDATE user SET password = ? WHERE email = ?',
      [hashedPassword, email],
      (updateErr, result) => {
        if (updateErr) {
          console.error('Update error:', updateErr);
          return res.status(500).json({ error: 'Failed to update password', details: updateErr.message });
        }

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

// Get unique filter values for dropdowns (MUST come before /:id route)
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

// Get single stock item by ID (MUST come after specific routes)
app.get('/api/stocks/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM Inventory WHERE ItemID = ?';

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching stock item:", err);
      return res.status(500).json({ error: "Failed to fetch stock item" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(results[0]);
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

  const { name, quantity, brand, ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated, imagePath } = req.body;

  const sql = 'INSERT INTO Inventory (ItemName, Quantity, Brand, ItemClass, ItemType, ItemCategory, Supplier, UnitPrice, DateAdded, LastUpdated, ImagePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(sql, [name, quantity, brand, ItemClass, type, category, supplier, unitPrice, dateAdded, lastUpdated, imagePath || 'placeholder.png'], (err, result) => {

    if (err) return res.status(500).json({ error: 'Error adding stock', details: err.message });

    res.status(201).json({ message: 'Stock added', id: result.insertId });
  });
});

// Update stock item
app.put('/api/stocks/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, brand, ItemClass, type, category, supplier, unitPrice, imagePath } = req.body;

  const sql = `
    UPDATE Inventory 
    SET ItemName = ?, Quantity = ?, Brand = ?, ItemClass = ?, ItemType = ?, 
        ItemCategory = ?, Supplier = ?, UnitPrice = ?, ImagePath = ?, LastUpdated = NOW()
    WHERE ItemID = ?
  `;

  connection.query(
    sql,
    [name, quantity, brand, ItemClass, type, category, supplier, unitPrice, imagePath || 'placeholder.png', id],
    (err, result) => {
      if (err) {
        console.error('Error updating stock:', err);
        return res.status(500).json({ error: 'Error updating stock', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Stock item not found' });
      }

      res.json({ message: 'Stock updated successfully', id: id });
    }
  );
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

  connection.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error('Error generating item report:', err);
      return res.status(500).json({ error: 'Failed to generate item report', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get movement history for this item
    const movementSql = `
      SELECT * FROM MovementHistory 
      WHERE ItemID = ? 
      ORDER BY MovementDate DESC 
      LIMIT 50
    `;

    connection.query(movementSql, [itemId], (movErr, movements) => {
      if (movErr) {
        console.error('Error fetching movements:', movErr);
        return res.status(500).json({ error: 'Failed to fetch movement history' });
      }

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

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error generating overall report:', err);
      return res.status(500).json({ error: 'Failed to generate overall report', details: err.message });
    }

    // Calculate summary statistics
    const summary = {
      total_items: results.length,
      total_quantity: results.reduce((sum, item) => sum + (item.Quantity || 0), 0),
      total_value: results.reduce((sum, item) => sum + ((item.Quantity || 0) * (item.UnitPrice || 0)), 0),
      low_stock_items: results.filter(item => item.Quantity < 10).length,
      out_of_stock_items: results.filter(item => item.Quantity === 0).length,
      by_category: {}
    };

    // Group by category
    results.forEach(item => {
      const category = item.ItemCategory || 'Uncategorized';
      if (!summary.by_category[category]) {
        summary.by_category[category] = {
          count: 0,
          total_quantity: 0,
          total_value: 0
        };
      }
      summary.by_category[category].count++;
      summary.by_category[category].total_quantity += item.Quantity || 0;
      summary.by_category[category].total_value += (item.Quantity || 0) * (item.UnitPrice || 0);
    });

    res.json({
      summary: summary,
      items: results,
      generated_at: new Date().toISOString()
    });
  });
});

// Generate CSV export for inventory
app.get('/api/reports/inventory/csv', (req, res) => {
  const sql = 'SELECT * FROM Inventory ORDER BY ItemName ASC';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error generating CSV:', err);
      return res.status(500).json({ error: 'Failed to generate CSV', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send('No data available');
    }

    // Create CSV headers
    const headers = Object.keys(results[0]).join(',');

    // Create CSV rows
    const rows = results.map(row => {
      return Object.values(row).map(value => {
        // Handle null values and escape commas
        if (value === null) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
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
      i.*,
      m.MovementType,
      m.FromLocation,
      m.ToLocation,
      m.Quantity as MovementQuantity,
      m.MovedBy,
      m.MovementDate,
      m.Notes
    FROM Inventory i
    LEFT JOIN MovementHistory m ON i.ItemID = m.ItemID
    WHERE i.ItemID = ?
    ORDER BY m.MovementDate DESC
  `;

  connection.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error('Error generating item CSV:', err);
      return res.status(500).json({ error: 'Failed to generate CSV', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).send('Item not found');
    }

    // Create CSV headers
    const headers = Object.keys(results[0]).join(',');

    // Create CSV rows
    const rows = results.map(row => {
      return Object.values(row).map(value => {
        if (value === null) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
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




// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
