-- Insert March 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('march-2026', 'March', 2026, 'March 2026', 'assets/images/covers/mar26_cover.jpg', 'assets/files/TrueBread_Mar_2026.pdf', 'March edition featuring articles on faith under pressure, the art of preaching, Christian communication in the cyber world, and financial literacy.', '2026-03-01', 15);

-- Insert highlights for march 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(44, 'march-2026', 'Are You Also One of Them?'),
(45, 'march-2026', 'Preaching: The Art of Communication'),
(46, 'march-2026', 'Financial Literacy');
