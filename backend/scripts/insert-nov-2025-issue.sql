-- Insert November 2025 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('november-2025', 'November', 2025, 'November 2025', 'assets/images/covers/nov25_cover.jpg', 'assets/files/TrueBread_Nov_2025.pdf', 'November edition focusing on grace, parenting challenges, and biblical prophecies.', '2025-11-01', 11);

-- Insert highlights for november 2025 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(32, 'november-2025', 'Grace to Face Failures'),
(33, 'november-2025', 'The Word of Anguish'),
(34, 'november-2025', '666: The Mark of the Beast');
