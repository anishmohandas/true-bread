CREATE TABLE IF NOT EXISTS editorials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    editor_name VARCHAR(100) NOT NULL,
    editor_role VARCHAR(100),
    editor_image_url TEXT,
    editor_bio TEXT,
    image_url TEXT,
    month VARCHAR(20),
    year INTEGER,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample editorial
INSERT INTO editorials (
    title, content, excerpt, publish_date, 
    editor_name, editor_role, editor_image_url, editor_bio,
    image_url, month, year, published
) VALUES (
    'Welcome to Our First Editorial',
    'This is the full content of our first editorial...',
    'A brief introduction to our editorial section',
    CURRENT_TIMESTAMP,
    'John Doe',
    'Chief Editor',
    'https://example.com/editor.jpg',
    'John has been writing for 15 years...',
    'https://example.com/editorial.jpg',
    'January',
    2024,
    true
);