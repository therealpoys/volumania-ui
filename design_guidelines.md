# Volumania UI Design Guidelines

## Design Approach
**System-Based Approach**: Using Material Design for this data-heavy Kubernetes management interface, emphasizing clarity, functionality, and enterprise-grade reliability.

## Design Principles
- **Data-First**: Information hierarchy prioritizes PVC metrics and status
- **Enterprise Reliability**: Clean, professional aesthetic suitable for DevOps teams
- **Kubernetes Context**: Familiar patterns from kubectl and K8s dashboards

## Core Design Elements

### Color Palette
**Primary Colors (Dark Mode)**:
- Background: 213 20% 12% (deep navy-gray)
- Surface: 213 15% 18% (elevated surfaces)
- Primary: 210 100% 60% (Kubernetes blue)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

**Light Mode**:
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 100% 45%
- Text Primary: 0 0% 12%

**Status Colors**:
- Success: 142 76% 36% (healthy PVCs)
- Warning: 45 100% 51% (approaching limits)
- Error: 0 84% 60% (failed operations)

### Typography
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for metrics, YAML configs)
- Headers: 600 weight, appropriate sizing
- Body: 400 weight, 16px base
- Code/Metrics: Monospace, 14px

### Layout System
**Tailwind Spacing**: Consistent use of 4, 6, 8 units
- Padding: p-4, p-6, p-8
- Margins: m-4, m-6, m-8
- Gaps: gap-4, gap-6, gap-8

### Component Library

**Navigation**:
- Top navigation bar with namespace selector
- Sidebar with main sections: Dashboard, PVCs, Autoscalers, Settings

**Data Display**:
- **PVC Cards**: Compact cards showing name, namespace, size, usage percentage with progress bars
- **Metrics Tables**: Sortable columns for name, namespace, size, usage, autoscaler status
- **Usage Charts**: Simple line charts for historical usage trends
- **Status Indicators**: Dot indicators (green/yellow/red) for PVC health

**Forms**:
- **Create Autoscaler Form**: Multi-step form with validation
- **Input Fields**: Material-style floating labels
- **Selectors**: Dropdown for PVC selection, namespace filtering
- **Configuration Panel**: YAML preview alongside form inputs

**Overlays**:
- **Modal Dialogs**: For autoscaler creation/editing
- **Confirmation Dialogs**: For destructive actions
- **Toast Notifications**: Success/error feedback

### Key UI Patterns

**Dashboard Layout**:
- Summary cards at top (total PVCs, active autoscalers, recent events)
- Main content area with tabbed interface (All PVCs / Autoscalers / Events)
- Filtering toolbar with namespace, status, and search

**PVC Details View**:
- Header with PVC name, namespace, and key metrics
- Tabbed content: Overview, Usage History, Autoscaler Config, Events
- Action buttons for creating/editing autoscalers

**Data Visualization**:
- Progress bars for usage percentages with color coding
- Small sparkline charts for usage trends
- Simple bar charts for size comparisons

### Interaction Design
- **Hover States**: Subtle elevation on cards and buttons
- **Loading States**: Skeleton placeholders for data loading
- **Empty States**: Helpful illustrations and guidance for no data scenarios
- **Error Handling**: Clear error messages with suggested actions

### Responsive Behavior
- **Desktop**: Full sidebar navigation, multi-column layouts
- **Tablet**: Collapsible sidebar, stacked cards
- **Mobile**: Bottom navigation, single column, simplified views

This design system emphasizes functionality and data clarity while maintaining a modern, professional appearance suitable for Kubernetes operations teams.