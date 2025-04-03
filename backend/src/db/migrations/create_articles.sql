-- Ensure the database uses UTF-8 encoding
SET client_encoding = 'UTF8';

-- Create articles table with proper text encoding
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    works_at VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    publish_date DATE NOT NULL,
    read_time INTEGER NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    language VARCHAR(2) NOT NULL,
    
    -- Malayalam fields with proper encoding
    title_ml TEXT,
    author_ml TEXT,
    job_title_ml TEXT,
    works_at_ml TEXT,
    category_ml TEXT,
    alt_text_ml TEXT,
    content_ml TEXT,
    excerpt_ml TEXT,
    
    -- Add collation for Malayalam text
    CONSTRAINT proper_encoding CHECK (
        title_ml IS NULL OR title_ml ~ '^[\u0D00-\u0D7F\s\p{P}]+$'
    )
);

-- Create table for article images
CREATE TABLE IF NOT EXISTS article_images (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(50) REFERENCES articles(id),
    url VARCHAR(255) NOT NULL,
    alt VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    -- Malayalam fields
    alt_ml VARCHAR(255),
    caption_ml VARCHAR(255)
);

-- Create table for article tags
CREATE TABLE IF NOT EXISTS article_tags (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(50) REFERENCES articles(id),
    tag VARCHAR(50) NOT NULL,
    tag_ml VARCHAR(50)
);

-- Add indices for better performance on language-specific searches
CREATE INDEX idx_articles_title_ml ON articles USING gin(to_tsvector('simple', title_ml));
CREATE INDEX idx_articles_content_ml ON articles USING gin(to_tsvector('simple', content_ml));
CREATE INDEX idx_articles_category_ml ON articles USING btree(category_ml);

-- Insert articles
INSERT INTO articles (
    id, title, author, job_title, works_at, category, 
    image_url, alt_text, content, excerpt, publish_date, 
    read_time, is_featured,language
) VALUES 
(
    'voice-from-the-heart-beyond-words',
    'Voice from the Heart, Beyond Words',
    'Sneha Samuel',
    '',
    '',
    'Faith & Society',
    'assets/images/articles/church-unity.jpg',
    'A diverse group of Christians worshipping together',
    'A heartfelt reflection on Christian unity, church traditions, and the true meaning of worship beyond denominational boundaries...',
    'A heartfelt reflection on Christian unity, church traditions, and the true meaning of worship beyond denominational boundaries...',
    '2024-06-18',
    8,
    true,1
),
(
    'for-she-loved-much',
    'For She Loved Much',
    'Rachel John',
    '',
    '',
    'Biblical Studies',
    'assets/images/articles/mary-magdalene.jpg',
    'Artistic representation of Mary Magdalene',
    'Mary Magdalene from a small town of Magdala was the most inspiring woman character in the Bible. She is appreciated along with the other women who had followed Jesus and His disciples on their preaching tours, and had supplied generously out of their means. (Lk.8:2,3) She had a good reason to quietly serve her Lord and express her gratitude to the One who redeemed her from the tombs of agony and torture of evil spirits...',
    'Exploring the profound devotion and love of Mary Magdalene, from her redemption to her faithful presence at the cross...',
    '2024-03-22',
    10,
    true,1
),
(
    'women-and-crisis-lessons-from-eve',
    'Women and Crisis: Lessons from the Life of Eve',
    'Dr. Annie George',
    'Principal',
    'Faith Theological Seminary',
    'Biblical Studies',
    'assets/images/articles/eve-garden.jpg',
    'Artistic representation of Eve in the Garden of Eden',
    'Exploring the challenges and triumphs of the first woman, Eve, and the valuable lessons her life offers to women today...',
    'Exploring the challenges and triumphs of the first woman, Eve, and the valuable lessons her life offers to women today...',
    '2024-03-08',
    15,
    true,1
),
(
    'the-vulture-and-the-little-girl',
    'The Vulture and the Little Girl',
    'Dr. Binu B. Peniel',
    'Principal',
    'Faith Theological Seminary',
    'Faith & Society',
    'assets/images/articles/vulture-girl.jpg',
    'The Vulture and the Little Girl - 1993 Pulitzer Prize winning photograph',
    'A profound reflection on Kevin Carter''s haunting 1993 photograph from Sudan, exploring its impact on humanity and the Christian response to suffering in our world...',
    'A profound reflection on Kevin Carter''s haunting 1993 photograph from Sudan, exploring its impact on humanity and the Christian response to suffering in our world...',
    '2024-03-15',
    12,
    true,1
),
(
    'parenting-with-grace-to-let-go',
    'PARENTING WITH GRACE TO LET GO',
    'Mrs. Renji Sam',
    'Counselor',
    'Director of Extension Department FTS',
    'Faith',
    'assets/images/articles/parenting-grace.jpg',
    'Parenting with Grace to Let Go image',
    'An exploration of how Christianity adapts and remains relevant in our modern world...',
    'An exploration of how Christianity adapts and remains relevant in our modern world...',
    '2024-03-15',
    8,
    true,1
);

-- Insert article images
INSERT INTO article_images (article_id, url, alt, caption) VALUES
(
    'voice-from-the-heart-beyond-words',
    'assets/images/articles/church-unity-main.jpg',
    'Diverse Christian worship gathering',
    'Christians from different traditions coming together in worship'
),
(
    'voice-from-the-heart-beyond-words',
    'assets/images/articles/church-history.jpg',
    'Historical church building',
    'A reminder of our rich Christian heritage and traditions'
),
(
    'for-she-loved-much',
    'assets/images/articles/mary-magdalene-main.jpg',
    'Mary Magdalene at the cross',
    'Mary Magdalene''s devotion led her to follow Jesus to the cross'
),
(
    'for-she-loved-much',
    'assets/images/articles/resurrection-garden.jpg',
    'Garden of resurrection',
    'The garden where the risen Christ appeared to Mary Magdalene'
),
(
    'women-and-crisis-lessons-from-eve',
    'assets/images/articles/eve-garden-main.jpg',
    'Artistic depiction of Eve in the Garden of Eden',
    'Eve''s story begins in the Garden of Eden'
),
(
    'women-and-crisis-lessons-from-eve',
    'assets/images/articles/eve-legacy.jpg',
    'Symbolic representation of Eve''s legacy',
    'Eve''s legacy continues through generations of women'
),
(
    'the-vulture-and-the-little-girl',
    'assets/images/articles/vulture-girl-main.jpg',
    'The Vulture and the Little Girl - Kevin Carter''s Pulitzer Prize photograph',
    'Kevin Carter''s 1993 Pulitzer Prize-winning photograph from Sudan'
),
(
    'the-vulture-and-the-little-girl',
    'assets/images/articles/kevin-carter.jpg',
    'Kevin Carter portrait',
    'Photographer Kevin Carter who captured the iconic image'
);

-- Insert article tags
INSERT INTO article_tags (article_id, tag) VALUES
('voice-from-the-heart-beyond-words', 'Christianity'),
('voice-from-the-heart-beyond-words', 'Church Unity'),
('voice-from-the-heart-beyond-words', 'Faith'),
('voice-from-the-heart-beyond-words', 'Worship'),
('voice-from-the-heart-beyond-words', 'Traditions'),
('voice-from-the-heart-beyond-words', 'Spirituality'),
('for-she-loved-much', 'Biblical Studies'),
('for-she-loved-much', 'Women'),
('for-she-loved-much', 'Faith'),
('for-she-loved-much', 'Devotion'),
('for-she-loved-much', 'Jesus'),
('for-she-loved-much', 'Bible Stories'),
('women-and-crisis-lessons-from-eve', 'Biblical Studies'),
('women-and-crisis-lessons-from-eve', 'Women'),
('women-and-crisis-lessons-from-eve', 'Faith'),
('women-and-crisis-lessons-from-eve', 'Redemption'),
('women-and-crisis-lessons-from-eve', 'Genesis'),
('women-and-crisis-lessons-from-eve', 'Bible Stories'),
('the-vulture-and-the-little-girl', 'Faith'),
('the-vulture-and-the-little-girl', 'Society'),
('the-vulture-and-the-little-girl', 'Photojournalism'),
('the-vulture-and-the-little-girl', 'Christianity'),
('the-vulture-and-the-little-girl', 'Social Justice'),
('the-vulture-and-the-little-girl', 'Humanity'),
('parenting-with-grace-to-let-go', 'Christianity'),
('parenting-with-grace-to-let-go', 'Modern Faith'),
('parenting-with-grace-to-let-go', 'Digital Church');


