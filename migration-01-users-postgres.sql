-- Create users table - PostgreSQL Version
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'kasir')) DEFAULT 'kasir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin account
-- Username: admin
-- Password: admin123
INSERT INTO users (username, password, full_name, role) VALUES
  ('admin', 'admin123', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Trigger for updated_at on users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
