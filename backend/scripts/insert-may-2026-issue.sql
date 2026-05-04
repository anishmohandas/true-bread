-- Insert May 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('may-2026', 'May', 2026, 'May 2026', 'assets/images/covers/may26_cover.jpg', 'assets/files/TrueBread_May_2026.pdf', 'May edition featuring social reflection, covenant-focused family stewardship, and practical faith-centered living.', '2026-05-01', 17);

-- Insert highlights for may 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(50, 'may-2026', 'A Covenant That Protects Today and Secures Tomorrow'),
(51, 'may-2026', 'Social Reflection: Caste Discrimination'),
(52, 'may-2026', 'The Message of the Cross');
