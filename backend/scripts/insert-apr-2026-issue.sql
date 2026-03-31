-- Insert April 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('april-2026', 'April', 2026, 'April 2026', 'assets/images/covers/apr26_cover.jpg', 'assets/files/TrueBread_Apr_2026.pdf', 'April edition featuring Easter reflections, theological insights, and The Seven Symbols of the Crucifixion: Revealing Who Jesus Is.', '2026-04-01', 16);

-- Insert highlights for april 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(47, 'april-2026', 'Easter Message'),
(48, 'april-2026', 'The Seven Symbols of the Crucifixion: Revealing Who Jesus Is'),
(49, 'april-2026', 'Doctrinal Formation in Christian Ministry');
