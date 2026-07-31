-- Insert August 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('august-2026', 'August', 2026, 'August 2026', 'assets/images/covers/aug26_cover.jpg', 'assets/files/TrueBread_Aug_2026.pdf', 'August edition featuring faith perseverance, social-spiritual reflection, and the path from protest to redemption in Christ.', '2026-08-01', 20);

-- Insert highlights for august 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(59, 'august-2026', 'Faith Persistence: A Biblical Perspective'),
(60, 'august-2026', 'Jantar Mantar to Golgotha'),
(61, 'august-2026', 'Questions That Have No Answers');
