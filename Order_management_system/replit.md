# Overview

This is a full-stack Order Management System built as a React.js frontend with an Express.js backend. The application allows users to manage orders, products, and customers through a modern web interface. It features a dashboard with analytics, order tracking, product management, and customer management capabilities. The system is designed to handle order workflows from creation to fulfillment, with features like invoice generation, status tracking, and search/filtering functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React.js with TypeScript using Vite as the build tool
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS for utility-first styling with CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Theme Support**: Dark/light mode switching with context-based theme provider

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Access**: Drizzle ORM for type-safe database queries
- **Storage**: In-memory storage implementation with interface for easy database migration
- **File Handling**: Multer for PDF file uploads with built-in validation
- **PDF Generation**: PDFKit for generating invoices
- **API Design**: RESTful endpoints with proper error handling and logging middleware

## Database Schema
- **Customers**: Basic customer information with contact details
- **Products**: Product catalog with pricing, stock, and categorization
- **Orders**: Order tracking with customer references, item details, and status management
- **Schema Management**: Drizzle migrations with PostgreSQL dialect configured

## Data Layer Design
- **Interface Pattern**: IStorage interface allows switching between in-memory and database storage
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Validation**: Zod schemas for runtime validation and type inference
- **Search & Filtering**: Advanced query capabilities with pagination, sorting, and filtering

## Development Tooling
- **Bundling**: Vite for fast development and optimized production builds
- **Type Checking**: Strict TypeScript configuration with path mapping
- **Code Quality**: ESLint integration with proper module resolution
- **Development Server**: Hot module replacement with error overlay for debugging

# External Dependencies

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Zod integration for form validation
- **wouter**: Lightweight routing solution
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities
- **class-variance-authority**: Type-safe CSS class variants
- **tailwind-merge**: Intelligent Tailwind class merging

## Backend Libraries
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Integration between Drizzle and Zod schemas
- **@neondatabase/serverless**: Neon database driver for PostgreSQL
- **pdfkit**: PDF generation for invoices
- **multer**: File upload middleware
- **express**: Web framework for Node.js
- **zod**: Runtime type validation

## Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tailwindcss**: Utility-first CSS framework
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit integration for development

## Database Configuration
- **PostgreSQL**: Primary database with Neon serverless driver
- **Drizzle Kit**: Database migrations and schema management
- **Connection**: Environment-based DATABASE_URL configuration