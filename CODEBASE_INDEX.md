# True Bread Codebase Index

## Overview
This document provides a structured overview of the True Bread project codebase. The project consists of an Angular frontend and Node.js backend.

## Frontend (Angular)
Location: `src/`

### Key Components
- **app/**: Main application components and services
  - `app.module.ts` - Root application module
  - `app-routing.module.ts` - Application routing configuration
- **components/**: UI components organized by feature
  - `about/` - About page components
  - `article-detail/` - Article detail view
  - `articles/` - Article listing components
  - `pdf-preview/` - PDF viewer component
  - `publications/` - Publication browser
- **services/**: Business logic and data services
  - `article.service.ts` - Article data service
  - `pdf-conversion.service.ts` - PDF processing service
  - `subscription.service.ts` - Subscription management
- **assets/**: Static resources
  - `data/` - Sample data (articles.json, publications.json)
  - `files/` - PDF publications
  - `fonts/` - Custom fonts
  - `images/` - Application images

### Configuration
- `angular.json` - Angular build configuration
- `tsconfig.*.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Backend (Node.js)
Location: `backend/`

### Core Structure
- **src/**: Backend source code
  - `app.ts` - Main application entry
  - `server.ts` - HTTP server configuration
- **controllers/**: API endpoint handlers
  - `article.controller.ts` - Article-related endpoints
  - `pdf.controller.ts` - PDF processing endpoints
- **services/**: Business logic
  - `email.service.ts` - Email sending functionality
- **repositories/**: Data access layer
  - `article.repository.ts` - Article database operations
- **db/**: Database schemas and scripts
  - `create_database.sql` - Database initialization script
  - `truebread_data.sql` - Sample data import

### Utility Scripts
- **scripts/**: PDF processing utilities
  - `pdf-to-images.js` - PDF to image conversion
  - `create-placeholder-pages.js` - PDF placeholder generation

## Shared Resources
- `interfaces/` - TypeScript type definitions
- `shared/` - Shared validation utilities

## Project Configuration
- `package.json` - Frontend dependencies
- `backend/package.json` - Backend dependencies
- `tsconfig.json` - Base TypeScript configuration
- `.gitignore` - Version control ignore rules
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

## Key Features Implemented
- PDF publication management system
- Article browsing interface
- Email subscription service
- Responsive UI components
- Database integration (SQL scripts)
