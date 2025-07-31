-- Script to delete the August 2025 issue and all related data
-- This script removes all data associated with the August 2025 issue

-- First, delete article images and tags (dependent on articles)
DELETE FROM article_images WHERE article_id IN (
    SELECT id FROM articles WHERE id IN ('nourishing-the-body-honoring-the-creator', 'the-youth-in-exile', 'blessed-in-the-beatitudes-counter-narrative')
);

DELETE FROM article_tags WHERE article_id IN (
    SELECT id FROM articles WHERE id IN ('nourishing-the-body-honoring-the-creator', 'the-youth-in-exile', 'blessed-in-the-beatitudes-counter-narrative')
);

-- Then delete the articles themselves
DELETE FROM articles WHERE id IN ('nourishing-the-body-honoring-the-creator', 'the-youth-in-exile', 'blessed-in-the-beatitudes-counter-narrative');

-- Delete publication highlights (dependent on publications)
DELETE FROM publication_highlights WHERE publication_id = 'august-2025';

-- Finally, delete the publication itself
DELETE FROM publications WHERE id = 'august-2025';

-- Verify deletions by checking that no related records remain
-- These queries should return 0 rows after execution
-- SELECT * FROM articles WHERE id IN ('nourishing-the-body-honoring-the-creator', 'the-youth-in-exile', 'blessed-in-the-beatitudes-counter-narrative');
-- SELECT * FROM article_images WHERE article_id IN ('nourishing-the-body-honoring-the-creator', 'the-youth-in-exile', 'blessed-in-the-beatitudes-counter-narrative');
-- SELECT * FROM article_tags WHERE article_id IN ('nourishing-the-body-honoring-the-creator', 'the-youth-in-exile', 'blessed-in-the-beatitudes-counter-narrative');
-- SELECT * FROM publication_highlights WHERE publication_id = 'august-2025';
-- SELECT * FROM publications WHERE id = 'august-2025';
