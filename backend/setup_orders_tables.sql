-- Create Orders table to store customer order information
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
);

-- Create Order Items table to store individual items in each order
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id)
);
