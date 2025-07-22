-- MySQL compatible version of True Bread database
-- Converted from PostgreSQL

-- Remove PostgreSQL-specific settings
-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', 0);
-- SET check_function_bodies = 0;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = off;

-- SET default_tablespace = '';
-- SET default_table_access_method = heap;

-- Create article_images table
CREATE TABLE `article_images` (
    `id` int NOT NULL AUTO_INCREMENT,
    `article_id` varchar(50),
    `url` varchar(255) NOT NULL,
    `alt` varchar(255) NOT NULL,
    `caption` varchar(255),
    `alt_ml` varchar(255),
    `caption_ml` varchar(255),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create article_tags table
CREATE TABLE `article_tags` (
    `id` int NOT NULL AUTO_INCREMENT,
    `article_id` varchar(50),
    `tag` varchar(50) NOT NULL,
    `tag_ml` varchar(50),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create articles table
CREATE TABLE `articles` (
    `id` varchar(50) NOT NULL,
    `title` varchar(255) NOT NULL,
    `author` varchar(100),
    `job_title` varchar(100),
    `works_at` varchar(100),
    `category` varchar(50),
    `image_url` varchar(255),
    `alt_text` varchar(255),
    `content` longtext,
    `excerpt` text,
    `published_date` datetime,
    `is_featured` tinyint(1) DEFAULT 0,
    `title_ml` varchar(255),
    `author_ml` varchar(100),
    `job_title_ml` varchar(100),
    `works_at_ml` varchar(100),
    `category_ml` varchar(50),
    `alt_text_ml` varchar(255),
    `content_ml` longtext,
    `excerpt_ml` text,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create editors table
CREATE TABLE `editors` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `email` varchar(100),
    `bio` text,
    `image_url` varchar(255),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create publication_highlights table
CREATE TABLE `publication_highlights` (
    `id` int NOT NULL AUTO_INCREMENT,
    `publication_id` varchar(50),
    `title` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create publications table
CREATE TABLE `publications` (
    `id` varchar(50) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text,
    `pdf_url` varchar(255),
    `cover_image` varchar(255),
    `published_date` datetime,
    `is_featured` tinyint(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create editorials table
CREATE TABLE `editorials` (
    `id` varchar(50) NOT NULL,
    `title` varchar(255) NOT NULL,
    `content` longtext,
    `editor_id` int,
    `published_date` datetime,
    `language` varchar(10) DEFAULT 'en',
    `title_ml` varchar(255),
    `content_ml` longtext,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create subscribers table
CREATE TABLE `subscribers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(100) NOT NULL,
    `name` varchar(100),
    `subscribed_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `is_active` tinyint(1) DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints
ALTER TABLE `article_images`
    ADD CONSTRAINT `article_images_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `article_tags`
    ADD CONSTRAINT `article_tags_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `editorials`
    ADD CONSTRAINT `editorials_editor_id_fkey` FOREIGN KEY (`editor_id`) REFERENCES `editors` (`id`);

ALTER TABLE `publication_highlights`
    ADD CONSTRAINT `publication_highlights_publication_id_fkey` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`);

-- Note: MySQL doesn't support GIN indexes, so we'll create regular indexes instead
CREATE INDEX `idx_articles_title` ON `articles` (`title`);
CREATE INDEX `idx_editorials_title` ON `editorials` (`title`);
CREATE INDEX `idx_editorials_language` ON `editorials` (`language`);
