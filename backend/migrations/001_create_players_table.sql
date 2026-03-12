CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'N/A',
    age VARCHAR(50) DEFAULT 'N/A',
    team VARCHAR(255) DEFAULT 'N/A',
    position VARCHAR(100) DEFAULT 'N/A',
    jersey_number VARCHAR(50) DEFAULT 'N/A',
    preferred_foot VARCHAR(50) DEFAULT 'N/A',
    height VARCHAR(50) DEFAULT 'N/A',
    weight VARCHAR(50) DEFAULT 'N/A',
    image_url VARCHAR(500) DEFAULT 'N/A'
);
