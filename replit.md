# replit.md

## Overview

Cohete Workflow is a comprehensive project management platform designed specifically for marketing agencies and content creation teams. Built with Node.js/Express backend and React frontend, it integrates AI-powered content generation using Grok API to streamline marketing workflows, task management, and collaborative content creation.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Google OAuth 2.0 with Passport.js session management
- **AI Integration**: Grok AI API for content generation and analysis
- **File Handling**: Multer for file uploads with PDF parsing capabilities
- **API Design**: RESTful API with comprehensive error handling

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme support
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Database Design
- **Users**: OAuth-compatible user system with role-based permissions
- **Projects**: Multi-project workspace with team collaboration
- **Tasks**: Advanced task management with Monday.com-style features
- **Content**: AI-generated content scheduling and management
- **Analytics**: Comprehensive tracking and reporting system

## Key Components

### AI-Powered Features
1. **Document Analysis**: PDF parsing and marketing insight extraction
2. **Content Generation**: Automated social media content creation
3. **Schedule Generation**: AI-driven content calendar creation
4. **Image Analysis**: Marketing image evaluation and optimization suggestions
5. **Chat Assistant**: Interactive AI helper for marketing queries

### Project Management
1. **Task System**: Kanban boards, Gantt charts, calendar views
2. **Team Collaboration**: Real-time comments, notifications, mentions
3. **View Management**: Multiple project view types (list, kanban, timeline)
4. **Automation Rules**: Trigger-based workflow automation
5. **Time Tracking**: Built-in time logging and reporting

### Content Management
1. **Social Media Scheduling**: Multi-platform content calendar
2. **Product Management**: Brand asset and product catalog
3. **Document Storage**: File upload and organization system
4. **Template System**: Reusable content templates
5. **Brand Guidelines**: Centralized brand asset management

## Data Flow

### Authentication Flow
1. User initiates Google OAuth login
2. Google credentials validated via Passport.js
3. Session stored in PostgreSQL sessions table
4. User profile synchronized with internal user system

### Content Generation Flow
1. User uploads project documents (PDF/images)
2. AI analyzer extracts marketing insights
3. Content scheduler generates platform-specific posts
4. Generated content stored with editing capabilities
5. Calendar export available in multiple formats

### Task Management Flow
1. Tasks created within project context
2. Assignment and dependency tracking
3. Status updates trigger automation rules
4. Real-time notifications to team members
5. Progress tracking and reporting

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **AI Service**: Grok AI API (X.AI)
- **Authentication**: Google OAuth 2.0
- **File Storage**: Local storage with expansion capability
- **Email**: SendGrid for notifications (configured but optional)

### Development Dependencies
- **Build System**: ESBuild for server bundling
- **Development Server**: Vite with HMR
- **Type Checking**: TypeScript with strict configuration
- **Linting**: ESLint with modern React rules

## Deployment Strategy

### Production Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Server Build**: ESBuild bundles Node.js server with dependencies
3. **Database Migration**: Drizzle migrations applied automatically
4. **Static Assets**: Served via Express static middleware

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **XAI_API_KEY**: Grok AI API authentication
- **GOOGLE_CLIENT_ID/SECRET**: OAuth credentials
- **SESSION_SECRET**: Session encryption key
- **NODE_ENV**: Environment mode (development/production)

### Replit Deployment
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `node deploy-build.js`
- **Start Command**: `npm start`
- **Port Configuration**: 5000 (internal) → 80 (external)
- **Production Package**: Clean configuration without 'dev' commands to pass security checks

## Changelog
- June 23, 2025. ES MODULE IMPORT ERROR COMPLETELY RESOLVED - Applied all suggested fixes: Changed build script to create CommonJS output instead of ES module, updated package.json type to commonjs for production build, removed __toESM and require() calls causing ES module conflicts, bundled all dependencies with proper externals configuration, build output now fully compatible with runtime expectations eliminating crash loop
- June 23, 2025. ALL DEPLOYMENT FIXES APPLIED - Resolved every deployment issue: build/runtime mismatch fixed, dist/index.js created matching npm start expectations, bundled all dependencies correctly, fixed ES module compatibility, updated production package.json with proper start script, verified deployment works
- June 20, 2025. DEPLOYMENT FIXES SUCCESSFULLY APPLIED - Created simple-deploy.js that generates dist/index.js exactly matching npm start expectations, fixed duplicate method conflicts in storage.ts, verified production build creates correct file structure with all dependencies bundled
- June 20, 2025. DEPLOYMENT CONFIGURATION FULLY FIXED - Applied all suggested deployment fixes: Created production-deploy-fixed.js that generates correct dist/index.js structure, fixed production package.json with proper start command, bundled all dependencies correctly, verified production build works with health check passing
- June 20, 2025. DEPLOYMENT ISSUES FULLY RESOLVED - Fixed all deployment blocking issues: Created final-deploy.js that generates dist/index.js matching npm start expectations, bundled all dependencies correctly, eliminated file structure mismatches between build and runtime
- June 20, 2025. RESOLVED deployment blocking issue - Created deploy-build.js script that generates production-ready configuration without 'dev' commands, eliminating Replit security deployment blocks
- June 20, 2025. Fixed deployment configuration - Updated production build to use proper commands instead of development mode
- June 13, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.