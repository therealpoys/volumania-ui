# Volumania - Kubernetes PVC AutoScaler

## Overview

Volumania is a Kubernetes-focused web application that provides automated scaling and management for Persistent Volume Claims (PVCs). The application offers real-time monitoring of storage usage across Kubernetes clusters and enables users to create and manage autoscalers that automatically resize PVCs when they approach capacity limits. Built with a modern full-stack architecture, it serves as an enterprise-grade DevOps tool for managing Kubernetes storage resources efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with TypeScript and Vite for fast development and optimized production builds
- **Component Library**: Utilizes shadcn/ui components with Radix UI primitives for accessible, professional UI elements
- **Styling System**: Tailwind CSS with custom design tokens following Material Design principles for enterprise applications
- **State Management**: TanStack Query for server state management with real-time WebSocket integration for live PVC updates
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom dark/light mode implementation with CSS custom properties

### Backend Architecture  
- **Node.js/Express**: RESTful API server with TypeScript for type safety
- **Kubernetes Integration**: Official Kubernetes client library (@kubernetes/client-node) for cluster communication
- **Real-time Communication**: WebSocket server for live PVC status updates and monitoring
- **Development Mode**: Mock data system when Kubernetes cluster is unavailable for local development
- **API Design**: Resource-based endpoints (/api/pvcs, /api/autoscalers) with proper error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Shared TypeScript schemas with Zod validation for consistent data models
- **In-Memory Storage**: Fallback storage interface for development and testing scenarios
- **Session Management**: PostgreSQL-backed session store using connect-pg-simple

### Authentication and Authorization
- **Session-based Auth**: Traditional session cookies with PostgreSQL storage
- **Development Mode**: Simplified authentication for local development
- **Security Headers**: Proper CORS and security middleware configuration

## External Dependencies

### Kubernetes Integration
- **@kubernetes/client-node**: Official Kubernetes JavaScript client for cluster API communication
- **Cluster Configuration**: Supports in-cluster, kubeconfig file, and environment variable configuration methods
- **Metrics API**: Integration with Kubernetes metrics server for storage usage data
- **Custom Resources**: Support for custom autoscaler resources and operators

### Database and Storage
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect for database operations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter and JetBrains Mono for professional typography

### Development and Build Tools
- **Vite**: Fast build tool with React plugin and development server
- **TypeScript**: Type safety across frontend, backend, and shared code
- **ESBuild**: Fast bundler for production server builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Real-time Features
- **WebSocket (ws)**: Native WebSocket server for real-time PVC updates
- **TanStack Query**: Client-side caching and synchronization with server state
- **React Hook Form**: Form validation and state management with Zod resolvers