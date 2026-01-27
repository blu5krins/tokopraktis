-- Migration for Stock Purchases table - PostgreSQL Version
CREATE TABLE IF NOT EXISTS stock_purchases (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  notes TEXT,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_purchase_date ON stock_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_product_id_purchases ON stock_purchases(product_id);

-- Trigger for updated_at
CREATE TRIGGER update_stock_purchases_updated_at BEFORE UPDATE ON stock_purchases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
