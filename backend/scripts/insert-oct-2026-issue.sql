-- Insert October 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('october-2026', 'October', 2026, 'October 2026', 'assets/images/covers/oct26_cover.jpg', 'assets/files/TrueBread_Oct_2026.pdf',
 'October edition featuring a mother''s cry for her hungry child, soft skills for today''s church youth, and lessons in faithful financial stewardship.', '2026-10-01', 22);

-- Insert highlights for october 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(65, 'october-2026', 'Mother, I Am Hungry'),
(66, 'october-2026', 'The Need for Soft Skills Among Today''s Church Youth'),
(67, 'october-2026', 'Don''t Let Your Money Sit Idle: Lessons in Faithful Stewardship');
