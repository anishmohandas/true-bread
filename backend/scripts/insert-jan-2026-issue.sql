-- Insert January 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('january-2026', 'January', 2026, 'January 2026', 'assets/images/covers/jan26_cover.jpg', 'assets/files/TrueBread_Jan_2026.pdf', 'January edition focusing on New Year greetings and the upcoming Kumbanad convention.', '2026-01-01', 13);

-- Insert highlights for january 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(38, 'january-2026', 'Let there be wonderful new beginnings.'),
(39, 'january-2026', 'Do you have friends?'),
(40, 'january-2026', 'Kumbanad Convention - a feature');
