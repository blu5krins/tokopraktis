-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default values
INSERT INTO settings (setting_key, setting_value) VALUES
  ('bank_name', ''),
  ('account_number', ''),
  ('account_holder', ''),
  ('qris_image', '')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
