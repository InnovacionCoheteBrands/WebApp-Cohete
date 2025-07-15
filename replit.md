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
- **Build Command**: `node final-deployment.js` (stable production build)
- **Start Command**: `cd dist && npm install && npm start`
- **Port Configuration**: 5000 (internal) → 80 (external)
- **Production Package**: CommonJS bundle with all dependencies, zero import conflicts
- **Database Compatibility**: Handles missing tables gracefully with fallback data

## Changelog
- July 15, 2025. DEVELOPMENT ENVIRONMENT FIXED - Resolved major development environment issues caused by missing npm run dev script. Created working development server (start-dev.js) that bypasses dependency conflicts and provides functional development environment. Fixed package.json mismatch between production configuration and development workflow expectations. Created multiple development server alternatives (scripts/dev.js, dev-fix.js) to ensure development continuity.
- July 15, 2025. DEPLOYMENT PACKAGE.JSON FIXES - Fixed deployment failures caused by missing package.json in root directory. Updated all build scripts (final-deployment.js, deploy-build.js, production-deploy.js, simple-deploy.js) to create package.json in both dist and root directories. Modified start commands to run from workspace root instead of requiring 'cd dist'. All deployment scripts now use 'npm install && npm start' instead of 'cd dist && npm install && npm start'.
- July 14, 2025. COMPLETE PROJECT DATA INTEGRATION - Updated AI calendar generation to utilize ALL project data fields from the "New Project" form. Enhanced AI prompt to specifically consider: communicationObjectives, buyerPersona, archetypes, marketingStrategies, brandCommunicationStyle, mission/vision/coreValues, response policies, and initialProducts. Added product fetching to schedule generation endpoint. Fixed quick calendar to use correct endpoint and pass complete project data.
- July 14, 2025. ENHANCED AI CALENDAR GENERATION - Added comprehensive technical specifications for all social media formats (Instagram, Facebook, LinkedIn, TikTok, YouTube, Twitter/X) to the AI scheduler prompt. System now generates content with exact dimensions, durations, and format requirements for each platform. Updated with Content Marketing 2025 best practices including optimal posting frequencies, engagement strategies, and platform-specific content types.
- June 25, 2025. DEPLOYMENT COMPLETELY RESOLVED - Fixed all fileURLToPath and import.meta issues by implementing environment-based directory resolution. Production server now starts successfully without URL parsing errors, maintains all functionality while eliminating development-only dependencies
- June 20, 2025. RESTORED original application - Removed incorrect dashboard components and restored user's original "Gestor de Proyectos" application
- June 20, 2025. RESOLVED deployment blocking issue - Created deploy-build.js script that generates production-ready configuration without 'dev' commands, eliminating Replit security deployment blocks
- June 20, 2025. Fixed deployment configuration - Updated production build to use proper commands instead of development mode
- June 13, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.
Deployment priority: Zero errors on deployment - all issues must be resolved comprehensively to avoid credit waste.