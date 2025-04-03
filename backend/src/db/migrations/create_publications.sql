-- Create publications table
CREATE TABLE IF NOT EXISTS publications (
    id VARCHAR(50) PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    cover_image VARCHAR(255) NOT NULL,
    pdf_url VARCHAR(255) NOT NULL,
    description TEXT,
    publish_date DATE NOT NULL,
    issue_number INTEGER NOT NULL
);

-- Create publication_highlights table for the highlights array
CREATE TABLE IF NOT EXISTS publication_highlights (
    id SERIAL PRIMARY KEY,
    publication_id VARCHAR(50) REFERENCES publications(id),
    title VARCHAR(255) NOT NULL
);

-- Insert publications
INSERT INTO publications (id, month, year, title, cover_image, pdf_url, description, publish_date, issue_number)
VALUES 
    ('march-2025', 'March', 2025, 'True Bread - March 2025', 
     'assets/images/march25_cover.jpg', 'assets/files/True Bread _ Mar_2025.pdf',
     'In this issue, we explore the depths of Christian faith in modern times...', 
     '2025-03-01', 3),
    ('february-2025', 'February', 2025, 'True Bread - February 2025',
     'assets/images/feb25_cover.jpg', 'assets/files/True Bread _ Feb_2025.pdf',
     'February''s edition focuses on love, fellowship, and community...', 
     '2025-02-01', 2),
    ('january-2025', 'January', 2025, 'True Bread - January 2025',
     'assets/images/jan25_cover.jpg', 'assets/files/True Bread _ Jan_2025.pdf',
     'Start the year with inspiring stories of faith and renewal...', 
     '2025-01-01', 1);

-- Insert highlights
INSERT INTO publication_highlights (publication_id, title)
VALUES 
    ('march-2025', 'Voice from the Heart, Beyond Words'),
    ('march-2025', 'For She Loved Much'),
    ('march-2025', 'The Vulture and the Little Girl'),
    ('february-2025', 'The Power of Christian Fellowship'),
    ('february-2025', 'Love in Action'),
    ('february-2025', 'Building Strong Communities'),
    ('january-2025', 'New Beginnings in Christ'),
    ('january-2025', 'Faith Stories for 2025'),
    ('january-2025', 'Prayer and Meditation Guide');

