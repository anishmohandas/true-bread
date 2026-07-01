-- Insert July 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('july-2026', 'July', 2026, 'July 2026', 'assets/images/covers/jul26_cover.jpg', 'assets/files/TrueBread_Jul_2026.pdf',
 'July edition featuring theological grounding for the church, intergenerational discipleship, and practical Christian living with God.', '2026-07-01', 19);

-- Insert highlights for july 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(56, 'july-2026', 'Theology in the Christian Church'),
(57, 'july-2026', 'Generation to Generation'),
(58, 'july-2026', 'Living with God');
