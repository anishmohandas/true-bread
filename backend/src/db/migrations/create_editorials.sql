-- Ensure the database uses UTF-8 encoding
SET client_encoding = 'UTF8';

-- Create editors table with Unicode support
CREATE TABLE IF NOT EXISTS editors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    -- Malayalam fields with proper encoding
    name_ml TEXT,
    role_ml TEXT,
    bio_ml TEXT,
    -- Add collation for Malayalam text
    CONSTRAINT editors_proper_encoding CHECK (
        name_ml IS NULL OR name_ml ~ '^[ഀ-ൿ\s\p{P}]+$'
    )
) WITH (OIDS=FALSE);

-- Create editorials table with Unicode support
CREATE TABLE IF NOT EXISTS editorials (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    publish_date DATE NOT NULL,
    editor_id INTEGER REFERENCES editors(id),
    image_url VARCHAR(255),
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    language VARCHAR(2) DEFAULT 'en',
    
    -- Malayalam fields with proper encoding
    title_ml TEXT,
    content_ml TEXT,
    excerpt_ml TEXT,
    month_ml TEXT,
    
    -- Add collation for Malayalam text
    CONSTRAINT editorials_proper_encoding CHECK (
        title_ml IS NULL OR title_ml ~ '^[ഀ-ൿ\s\p{P}]+$'
    )
);

-- Add indices for better performance on language-specific searches
CREATE INDEX idx_editorials_title_ml ON editorials USING gin(to_tsvector('simple', title_ml));
CREATE INDEX idx_editorials_content_ml ON editorials USING gin(to_tsvector('simple', content_ml));
CREATE INDEX idx_editorials_language ON editorials(language);

-- Insert sample editor
INSERT INTO editors (name, role, image_url, bio)
VALUES (
    'John Smith',
    'Chief Editor',
    'assets/images/editors/john-smith.jpg',
    'John Smith has been the Chief Editor of True Bread Magazine for over 10 years, bringing spiritual insights to readers worldwide.'
);

-- Insert sample editorial
INSERT INTO editorials (id, title, content, excerpt, publish_date, editor_id, image_url, month, year)
VALUES (
    'march-2025',
    'Walking in Faith Through Modern Times',
    'Full content of the editorial goes here...',
    'In this month''s editorial, we explore how to maintain strong faith in an increasingly secular world...',
    '2025-03-01',
    1,
    'assets/images/editorials/march-2025.jpg',
    'March',
    2025
);





