-- Insert December 2025 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('december-2025', 'December', 2025, 'December 2025', 'assets/images/covers/dec25_cover.jpg', 'assets/files/TrueBread_Dec_2025.pdf', 'December edition focusing on the true Christmas message and upcoming conventions.', '2025-12-01', 12);

-- Insert highlights for december 2025 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(35, 'december-2025', 'The Lost New Generation parents: Problems and Solutions'),
(36, 'december-2025', 'A God that hears your prayers'),
(37, 'december-2025', 'The Kingdom of God as told in the gospels');
