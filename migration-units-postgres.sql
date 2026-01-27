-- Migration untuk tabel units (master data satuan)

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_units_updated_at();

-- Insert default units
INSERT INTO units (name, description) VALUES
('pcs', 'Pieces - satuan per buah'),
('box', 'Box - satuan per kotak'),
('pack', 'Pack - satuan per bungkus'),
('kg', 'Kilogram - satuan berat'),
('liter', 'Liter - satuan volume'),
('meter', 'Meter - satuan panjang'),
('lusin', 'Lusin - 12 buah'),
('karton', 'Karton - satuan kemasan besar')
ON CONFLICT (name) DO NOTHING;
