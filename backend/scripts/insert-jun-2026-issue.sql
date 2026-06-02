-- Insert June 2026 issue into publications
INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('june-2026', 'June', 2026, 'June 2026', 'assets/images/covers/jun26_cover.jpg', 'assets/files/TrueBread_Jun_2026.pdf', 'June edition featuring teachings on spiritual preparedness, end-time signs, and intergenerational faith formation.', '2026-06-01', 18);

-- Insert highlights for june 2026 issue
INSERT INTO publication_highlights (id, publication_id, title) VALUES
(53, 'june-2026', 'From Generation to Generation'),
(54, 'june-2026', 'The Beginning of Birth Pains: Signs of the Times'),
(55, 'june-2026', 'Prepare for a Blessed Journey');
