# Volumania Backend API Specification

## Overview

This document specifies the REST API endpoints that the Volumania frontend expects from the backend. The frontend has been converted to use a mock service layer that implements this exact API, making integration straightforward.

## Base Configuration

- **Base URL**: `http://localhost:3001` (development) / `https://your-backend-api.com` (production)
- **Content-Type**: `application/json`
- **Authentication**: Session-based (if required)

## API Endpoints

### Health Check

#### `GET /api/health`
Get the health status of the API server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00Z",
  "version": "1.0.0"
}
```

### Persistent Volume Claims (PVCs)

#### `GET /api/pvcs`
Get all PVCs across all namespaces.

**Response:**
```json
[
  {
    "id": "pvc-1",
    "name": "app-data",
    "namespace": "production",
    "status": "Bound",
    "size": "20Gi",
    "usedSpace": "12Gi",
    "usagePercent": 60,
    "storageClass": "gp3",
    "accessModes": ["ReadWriteOnce"],
    "createdAt": "2024-01-15T10:00:00Z",
    "hasAutoscaler": true
  }
]
```

#### `GET /api/pvcs/:namespace/:name`
Get a specific PVC by namespace and name.

**Parameters:**
- `namespace` (string): The Kubernetes namespace
- `name` (string): The PVC name

**Response:**
```json
{
  "id": "pvc-1",
  "name": "app-data",
  "namespace": "production",
  "status": "Bound",
  "size": "20Gi",
  "usedSpace": "12Gi",
  "usagePercent": 60,
  "storageClass": "gp3",
  "accessModes": ["ReadWriteOnce"],
  "createdAt": "2024-01-15T10:00:00Z",
  "hasAutoscaler": true
}
```

**Error Response (404):**
```json
{
  "error": "PVC not found"
}
```

### AutoScalers

#### `GET /api/autoscalers`
Get all autoscalers.

**Response:**
```json
[
  {
    "id": "as-1",
    "name": "app-data-autoscaler",
    "namespace": "production",
    "pvcName": "app-data",
    "minSize": "10Gi",
    "maxSize": "100Gi",
    "stepSize": "10Gi",
    "triggerAbovePercent": 80,
    "checkIntervalSeconds": 30,
    "cooldownSeconds": 300,
    "status": "Active",
    "lastScaleTime": "2024-01-15T14:20:00Z",
    "createdAt": "2024-01-15T10:05:00Z"
  }
]
```

#### `GET /api/autoscalers/:id`
Get a specific autoscaler by ID.

**Parameters:**
- `id` (string): The autoscaler ID

**Response:** Same as single autoscaler object above.

**Error Response (404):**
```json
{
  "error": "AutoScaler not found"
}
```

#### `POST /api/autoscalers`
Create a new autoscaler.

**Request Body:**
```json
{
  "name": "app-data-autoscaler",
  "namespace": "production",
  "pvcName": "app-data",
  "minSize": "10Gi",
  "maxSize": "100Gi",
  "stepSize": "10Gi",
  "triggerAbovePercent": 80,
  "checkIntervalSeconds": 30,
  "cooldownSeconds": 300
}
```

**Response (201):**
```json
{
  "id": "as-2",
  "name": "app-data-autoscaler",
  "namespace": "production",
  "pvcName": "app-data",
  "minSize": "10Gi",
  "maxSize": "100Gi",
  "stepSize": "10Gi",
  "triggerAbovePercent": 80,
  "checkIntervalSeconds": 30,
  "cooldownSeconds": 300,
  "status": "Active",
  "lastScaleTime": null,
  "createdAt": "2024-01-15T14:30:00Z"
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed: minSize must be smaller than maxSize"
}
```

#### `DELETE /api/autoscalers/:id`
Delete an autoscaler.

**Parameters:**
- `id` (string): The autoscaler ID

**Response (200):**
```json
{
  "message": "AutoScaler deleted successfully"
}
```

**Response (404):**
```json
{
  "error": "AutoScaler not found"
}
```

## WebSocket Real-time Updates

### Connection
Connect to: `ws://localhost:3001/api/ws` (development) or `wss://your-backend-api.com/api/ws` (production)

### Message Format
The WebSocket sends updates for PVC data changes:

```json
{
  "type": "pvc-update",
  "data": [
    {
      "id": "pvc-1",
      "name": "app-data",
      "namespace": "production",
      "status": "Bound",
      "size": "25Gi",
      "usedSpace": "15Gi",
      "usagePercent": 60,
      "storageClass": "gp3",
      "accessModes": ["ReadWriteOnce"],
      "createdAt": "2024-01-15T10:00:00Z",
      "hasAutoscaler": true
    }
  ]
}
```

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": "Error message describing what went wrong",
  "details": "Optional additional details"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Data Types

### PVC Object
```typescript
interface PVC {
  id: string;
  name: string;
  namespace: string;
  status: "Bound" | "Pending" | "Lost";
  size: string;              // e.g., "20Gi"
  usedSpace: string;         // e.g., "12Gi"  
  usagePercent: number;      // 0-100
  storageClass: string;
  accessModes: string[];
  createdAt: string;         // ISO 8601 timestamp
  hasAutoscaler: boolean;
}
```

### AutoScaler Object
```typescript
interface AutoScaler {
  id: string;
  name: string;
  namespace: string;
  pvcName: string;
  minSize: string;           // e.g., "10Gi"
  maxSize: string;           // e.g., "100Gi"
  stepSize: string;          // e.g., "10Gi"
  triggerAbovePercent: number; // 1-100
  checkIntervalSeconds: number; // >= 10
  cooldownSeconds: number;   // >= 60
  status: "Active" | "Inactive" | "Error";
  lastScaleTime?: string;    // ISO 8601 timestamp or null
  createdAt: string;         // ISO 8601 timestamp
}
```

### CreateAutoScaler Request
```typescript
interface InsertAutoScaler {
  name: string;
  namespace: string;
  pvcName: string;
  minSize: string;
  maxSize: string;
  stepSize: string;
  triggerAbovePercent: number;
  checkIntervalSeconds: number;
  cooldownSeconds: number;
}
```

## Implementation Notes

1. **Size Format**: All size values use Kubernetes resource quantity format (e.g., "10Gi", "500Mi", "1Ti")

2. **Real-time Updates**: The WebSocket connection sends PVC updates whenever:
   - PVC usage changes
   - Autoscaler triggers a resize
   - PVC status changes

3. **Validation**: 
   - Size values must be valid Kubernetes quantities
   - Percentage values must be 1-100
   - Time intervals must meet minimum requirements
   - PVC names must exist in the specified namespace

4. **Authentication**: If implementing authentication, use session-based auth with cookies

5. **CORS**: Enable CORS for frontend domain in development/production

## Frontend Integration

The frontend uses the `apiService` abstraction layer that can switch between mock data and real API calls:

```typescript
// Enable real API mode
apiService.setMockMode(false);

// All API calls will now go to the real backend
const pvcs = await apiService.getAllPVCs();
```

The mock service implements this exact API specification, so integration should be seamless.