-- Insert November 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('november-2026', 'November', 2026, 'November 2026', 'assets/images/covers/nov26_cover.jpg', 'assets/files/TrueBread_Nov_2026.pdf',
 'November edition marking World Sunday School Day, featuring parents who dream God''s dreams for their children, behavioural psychology and the Bible, and new perspectives on Christian communication from the Book of Revelation.', '2026-11-01', 23);

-- Insert highlights for november 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(68, 'november-2026', 'World Sunday School Day'),
(69, 'november-2026', 'Parents Who See Divine Dreams for Their Children'),
(70, 'november-2026', 'Behavioural Psychology and the Bible'),
(71, 'november-2026', 'Book of Revelation and Media Culture: New Perspectives on Christian Communication');
