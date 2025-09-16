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
  "status": "healthy",
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
    "usedBytes": 12884901888,
    "totalBytes": 21474836480,
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
  "usedBytes": 12884901888,
  "totalBytes": 21474836480,
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
      "usedBytes": 16106127360,
      "totalBytes": 26843545600,
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
  usedBytes: number;         // bytes as number
  totalBytes: number;        // bytes as number  
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

## Extended API Endpoints for Enhanced Features

### Monitoring and Analytics

#### `GET /api/monitoring/overview`
Get comprehensive monitoring overview for the dashboard.

**Query Parameters:**
- `timeRange` (optional): `24h`, `7d`, `30d` (default: `24h`)
- `namespace` (optional): Filter by namespace

**Response:**
```json
{
  "metrics": {
    "totalStorage": "1TB",
    "usedStorage": "640GB", 
    "averageUsage": 65.2,
    "criticalPVCs": 2,
    "totalAutoScalers": 8,
    "activeAutoScalers": 7
  },
  "recentActivity": [
    {
      "timestamp": "2024-01-15T15:30:00Z",
      "type": "autoscaler_triggered",
      "pvcName": "app-data",
      "namespace": "production",
      "details": "Scaled from 20Gi to 25Gi"
    }
  ]
}
```

#### `GET /api/monitoring/metrics/timeseries`
Get time-series data for charts and graphs.

**Query Parameters:**
- `timeRange` (required): `24h`, `7d`, `30d`
- `metric` (required): `usage`, `iops`, `throughput`
- `namespace` (optional): Filter by namespace

**Response:**
```json
{
  "metric": "usage",
  "timeRange": "24h",
  "dataPoints": [
    {
      "timestamp": "2024-01-15T14:00:00Z",
      "value": 62.5,
      "unit": "percent"
    }
  ]
}
```

### PVC Management

#### `PUT /api/pvcs/:namespace/:name`
Update PVC configuration or labels.

**Request Body:**
```json
{
  "labels": {
    "environment": "production",
    "team": "backend"
  },
  "annotations": {
    "description": "Main application storage"
  }
}
```

**Response:**
```json
{
  "success": true,
  "pvc": {
    "id": "pvc-1",
    "name": "app-data", 
    "namespace": "production",
    "status": "Bound",
    "size": "25Gi",
    "usedBytes": 16106127360,
    "totalBytes": 26843545600,
    "usagePercent": 75.5,
    "storageClass": "gp3",
    "accessModes": ["ReadWriteOnce"],
    "createdAt": "2024-01-15T10:00:00Z",
    "hasAutoscaler": true,
    "labels": {
      "environment": "production",
      "team": "backend"
    }
  }
}
```

#### `POST /api/pvcs`
Create a new PVC.

**Request Body:**
```json
{
  "name": "new-storage",
  "namespace": "production",
  "size": "10Gi",
  "storageClass": "gp3",
  "accessModes": ["ReadWriteOnce"]
}
```

**Response:**
```json
{
  "success": true,
  "pvc": {
    "id": "pvc-new",
    "name": "new-storage",
    "namespace": "production", 
    "status": "Pending",
    "size": "10Gi",
    "usedBytes": 0,
    "totalBytes": 10737418240,
    "usagePercent": 0,
    "storageClass": "gp3",
    "accessModes": ["ReadWriteOnce"],
    "createdAt": "2024-01-15T16:00:00Z",
    "hasAutoscaler": false
  }
}
```

### AutoScaler Management

#### `PUT /api/autoscalers/:id`
Update an existing AutoScaler configuration.

**Request Body:**
```json
{
  "name": "updated-autoscaler",
  "minSize": "2Gi",
  "maxSize": "150Gi", 
  "stepSize": "10Gi",
  "triggerAbovePercent": 85,
  "checkIntervalSeconds": 120,
  "cooldownSeconds": 600
}
```

**Response:**
```json
{
  "success": true,
  "autoScaler": {
    "id": "as-123",
    "name": "updated-autoscaler",
    "namespace": "production",
    "pvcName": "app-data",
    "minSize": "2Gi",
    "maxSize": "150Gi",
    "stepSize": "10Gi", 
    "triggerAbovePercent": 85,
    "checkIntervalSeconds": 120,
    "cooldownSeconds": 600,
    "status": "Active",
    "lastScaleTime": "2024-01-15T15:30:00Z",
    "createdAt": "2024-01-15T14:00:00Z"
  }
}
```

#### `POST /api/autoscalers/:id/pause`
Pause/resume an AutoScaler.

**Request Body:**
```json
{
  "paused": true,
  "reason": "Maintenance window"
}
```

**Response:**
```json
{
  "success": true,
  "status": "Inactive",
  "message": "AutoScaler paused successfully"
}
```

### Advanced Analytics

#### `GET /api/analytics/usage-predictions`
Get storage usage predictions and recommendations.

**Query Parameters:**
- `namespace` (optional): Filter by namespace
- `days` (optional): Prediction timeframe (default: 30)

**Response:**
```json
{
  "predictions": [
    {
      "pvcId": "pvc-1",
      "pvcName": "app-data",
      "namespace": "production",
      "currentUsage": 75.5,
      "predictedUsage": {
        "7days": 82.1,
        "30days": 95.3
      },
      "recommendation": "Consider increasing max size from 100Gi to 150Gi",
      "confidence": 0.87
    }
  ]
}
```

#### `GET /api/analytics/cost-optimization`
Get cost optimization recommendations.

**Response:**
```json
{
  "recommendations": [
    {
      "type": "underutilized",
      "pvcId": "pvc-5", 
      "pvcName": "logs-storage",
      "namespace": "staging",
      "currentSize": "50Gi",
      "avgUsage": 15.2,
      "suggestedSize": "20Gi",
      "potentialSavings": "$15/month"
    }
  ],
  "totalPotentialSavings": "$45/month"
}
```

### Alerts and Notifications

#### `GET /api/alerts`
Get current alerts and warnings.

**Query Parameters:**
- `severity` (optional): `critical`, `warning`, `info`
- `namespace` (optional): Filter by namespace

**Response:**
```json
[
  {
    "id": "alert-1",
    "severity": "critical",
    "type": "high_usage",
    "pvcId": "pvc-1",
    "pvcName": "app-data",
    "namespace": "production", 
    "message": "PVC usage exceeded 90%",
    "createdAt": "2024-01-15T15:45:00Z",
    "acknowledged": false
  }
]
```

#### `POST /api/alerts/:id/acknowledge`
Acknowledge an alert.

**Response:**
```json
{
  "success": true,
  "alert": {
    "id": "alert-1",
    "acknowledged": true,
    "acknowledgedAt": "2024-01-15T16:00:00Z"
  }
}
```

## Production Deployment Considerations

### Performance
- Implement caching for frequently accessed metrics
- Use database indexing for PVC and AutoScaler queries
- Consider pagination for large datasets

### Security
- Implement rate limiting on API endpoints
- Validate all input parameters
- Use HTTPS in production
- Implement proper RBAC for Kubernetes access

### Monitoring
- Log all API requests and responses
- Monitor API response times
- Track AutoScaler trigger frequency
- Alert on failed Kubernetes API calls

### Scaling
- Support horizontal scaling of API server
- Implement connection pooling for Kubernetes API
- Consider caching layer (Redis) for metrics data