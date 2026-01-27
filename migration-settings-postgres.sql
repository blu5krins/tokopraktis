-- Create settings table - PostgreSQL Version
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values
INSERT INTO settings (setting_key, setting_value) VALUES
  ('bank_name', ''),
  ('account_number', ''),
  ('account_holder', ''),
  ('qris_image', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
