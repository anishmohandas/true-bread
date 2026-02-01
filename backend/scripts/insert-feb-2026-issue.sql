-- Insert February 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('february-2026', 'February', 2026, 'February 2026', 'assets/images/covers/feb26_cover.jpg', 'assets/files/TrueBread_Feb_2026.pdf', 'February edition featuring spiritual insights and faith-building content.', '2026-02-01', 14);

-- Insert highlights for february 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(41, 'february-2026', 'Walking in faith and purpose'),
(42, 'february-2026', 'Building stronger communities'),
(43, 'february-2026', 'Testimonies of transformation');
