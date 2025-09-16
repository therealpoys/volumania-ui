# Volumania - Kubernetes PVC AutoScaler

## Overview

Volumania is a frontend-only web application that demonstrates a user interface for Kubernetes PVC (Persistent Volume Claim) management and autoscaling. The application provides a modern dashboard for viewing storage usage and creating autoscalers, using mock data to simulate Kubernetes cluster interactions. Built with a React-based frontend architecture, it serves as a prototype for DevOps tools focused on storage resource management.

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

### Mock Data Architecture
- **Frontend-only Setup**: No backend server required - runs entirely in the browser
- **Mock API Service**: Simulates backend API calls with realistic data and timing
- **Type-safe Mocking**: Uses shared TypeScript schemas for consistent mock data generation
- **Real-time Simulation**: Mock updates to PVC status and usage metrics for demonstration purposes
- **API Specification**: Complete documentation for future backend implementation

## External Dependencies

### Mock Data System
- **Simulated Kubernetes Data**: Realistic PVC and AutoScaler mock data that mimics real cluster resources
- **Type Safety**: All mock data follows the same TypeScript schemas as real implementations would
- **Dynamic Updates**: Periodic updates to storage usage and status to simulate live cluster activity

### UI and Styling
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter and JetBrains Mono for professional typography

### Development and Build Tools
- **Vite**: Fast build tool with React plugin for frontend development and production builds
- **TypeScript**: Full type safety across frontend and shared schema definitions
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **TSX**: TypeScript execution for the simple Vite server

### Frontend Features
- **TanStack Query**: Client-side state management with mock API integration
- **React Hook Form**: Form validation and state management with Zod resolvers
- **Mock Real-time Updates**: Simulated live data updates for demonstration purposes