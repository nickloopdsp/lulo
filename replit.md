# Lulo - Social Fashion Discovery App

## Overview

Lulo is a social fashion discovery platform built as a full-stack web application with mobile-first design. The app allows users to create wishlists, digitize their closets, discover fashion items, and connect with friends around shared fashion interests. The platform combines e-commerce functionality with social features, enabling users to save items from any website, share their style, and discover new fashion through their network.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Lulo brand colors (pink, coral, sage, cream)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Build System
- **Development**: Vite for frontend development server
- **Production**: Vite for frontend build, esbuild for backend bundle
- **Type Checking**: TypeScript with strict mode enabled
- **Hot Reload**: Vite HMR for development experience

## Key Components

### Database Schema
- **Users**: Profile information, authentication data
- **Items**: Fashion items with metadata (name, price, brand, images, source URLs)
- **Wishlists**: User collections of desired items with privacy settings
- **Closets**: User collections of owned items with borrowing preferences
- **Social Features**: Follows, likes, and social interactions
- **Lookboards**: Visual collections combining wishlist and closet items
- **Sessions**: Required for Replit Auth implementation

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL with connect-pg-simple
- **Middleware**: Express middleware for route protection
- **Frontend Integration**: React hooks for auth state management

### API Design
- **RESTful Routes**: Express routes for CRUD operations
- **Data Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware
- **CORS**: Configured for cross-origin requests

### UI Components
- **Design System**: Custom components built on Radix UI
- **Mobile Navigation**: Bottom navigation bar for mobile UX
- **Modal System**: Dialog-based interactions for adding items
- **Form Components**: Reusable form inputs with validation
- **Card Components**: Item display cards with social actions

## Data Flow

### Item Discovery Flow
1. User discovers items through search or trending feeds
2. Items can be saved to wishlist or closet via API calls
3. Social interactions (likes, follows) update user feeds
4. React Query manages client-side caching and synchronization

### Authentication Flow
1. Replit Auth handles OpenID Connect flow
2. Sessions stored in PostgreSQL for persistence
3. Protected routes check authentication status
4. Frontend receives user data via authenticated API calls

### Database Operations
1. Drizzle ORM provides type-safe database operations
2. Connection pooling via Neon serverless PostgreSQL
3. Migrations managed through Drizzle Kit
4. Schema definitions shared between frontend and backend

## External Dependencies

### Authentication
- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Management**: PostgreSQL-based session storage

### Database
- **Neon**: Serverless PostgreSQL hosting
- **Connection**: WebSocket-based connection for serverless compatibility

### UI Framework
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild creates single bundle for Node.js
- **Assets**: Static files served from dist/public directory

### Environment Configuration
- **Database**: Requires DATABASE_URL environment variable
- **Authentication**: Requires REPLIT_DOMAINS and session secrets
- **Sessions**: Secure session configuration with HttpOnly cookies

### Development Workflow
- **Local Development**: tsx for TypeScript execution
- **Database Migrations**: Drizzle Kit for schema management
- **Type Checking**: Shared TypeScript configuration
- **Hot Reload**: Vite HMR for rapid development

### Performance Considerations
- **Query Optimization**: TanStack Query for efficient data fetching
- **Bundle Splitting**: Vite automatically splits bundles
- **Database Pooling**: Connection pooling for database efficiency
- **Caching**: Client-side caching with React Query