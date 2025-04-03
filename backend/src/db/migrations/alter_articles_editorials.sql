-- Add language column to articles table
ALTER TABLE articles
ADD COLUMN language VARCHAR(2) DEFAULT 'en';

-- Add language column to editorials table
ALTER TABLE editorials
ADD COLUMN language VARCHAR(2) DEFAULT 'en';

-- Create index for better performance on language searches
CREATE INDEX idx_articles_language ON articles(language);
CREATE INDEX idx_editorials_language ON editorials(language);

-- Update existing Malayalam articles
UPDATE articles 
SET language = 'ml' 
WHERE content_ml IS NOT NULL;

-- Update existing Malayalam editorials
UPDATE editorials 
SET language = 'ml' 
WHERE content_ml IS NOT NULL;