-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add vendor_id to stock_purchases table
ALTER TABLE stock_purchases 
ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_purchases_vendor_id ON stock_purchases(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

-- Migrate existing supplier_name to vendors table
INSERT INTO vendors (name)
SELECT DISTINCT supplier_name 
FROM stock_purchases 
WHERE supplier_name IS NOT NULL 
  AND supplier_name != ''
  AND NOT EXISTS (SELECT 1 FROM vendors WHERE name = stock_purchases.supplier_name)
ORDER BY supplier_name;

-- Update vendor_id in stock_purchases based on supplier_name
UPDATE stock_purchases 
SET vendor_id = vendors.id
FROM vendors
WHERE stock_purchases.supplier_name = vendors.name
  AND stock_purchases.vendor_id IS NULL;
