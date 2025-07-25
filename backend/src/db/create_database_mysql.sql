USE `truebread`;

CREATE TABLE IF NOT EXISTS `truebread`.`publications` (
    `id` VARCHAR(50) NOT NULL,
    `publication_month` VARCHAR(20) NOT NULL,
    `publication_year` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `cover_image` VARCHAR(255) NOT NULL,
    `pdf_url` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `publish_date` DATE NOT NULL,
    `issue_number` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: publication_highlights
CREATE TABLE `truebread`.publication_highlights (
    id SERIAL PRIMARY KEY,
    publication_id VARCHAR(50) NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL
);

-- Index for faster lookup (optional)
CREATE INDEX idx_publication_highlights_publication_id ON publication_highlights(publication_id);


CREATE TABLE editors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    name_ml TEXT,
    role_ml TEXT,
    bio_ml TEXT
);

CREATE TABLE editorials (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    publish_date DATE NOT NULL,
    editor_id INT,
    image_url VARCHAR(255),
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    language VARCHAR(2) DEFAULT 'en',
    title_ml TEXT,
    content_ml TEXT,
    excerpt_ml TEXT,
    month_ml TEXT,
    FOREIGN KEY (editor_id) REFERENCES editors(id)
);


CREATE TABLE article_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id VARCHAR(50),
    url VARCHAR(255) NOT NULL,
    alt VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    alt_ml VARCHAR(255),
    caption_ml VARCHAR(255)
);

CREATE TABLE article_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id VARCHAR(50),
    tag VARCHAR(50) NOT NULL,
    tag_ml VARCHAR(50)
);

CREATE TABLE articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    works_at VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    publish_date DATE NOT NULL,
    read_time INT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    language VARCHAR(2) NOT NULL,
    title_ml TEXT,
    author_ml TEXT,
    job_title_ml TEXT,
    works_at_ml TEXT,
    category_ml TEXT,
    alt_text_ml TEXT,
    content_ml TEXT,
    excerpt_ml TEXT
    -- Note: PostgreSQL regex CHECK constraint omitted; MySQL doesn't support it easily.
);

ALTER TABLE article_images
    ADD FOREIGN KEY (article_id) REFERENCES articles(id);

ALTER TABLE article_tags
    ADD FOREIGN KEY (article_id) REFERENCES articles(id);