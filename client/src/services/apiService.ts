import type { PVC, AutoScaler, InsertAutoScaler } from "@shared/schema";
import { mockApiService } from "./mockApiService";

// Configuration for API mode
export const API_CONFIG = {
  // Set to true for mock mode, false for real API calls
  USE_MOCK: true,
  
  // Base URL for real API (when USE_MOCK is false)
  BASE_URL: import.meta.env.MODE === 'production' 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://your-backend-api.com') 
    : 'http://localhost:3001'
};

class ApiService {
  // PVC Methods
  async getAllPVCs(): Promise<PVC[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.getAllPVCs();
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pvcs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch PVCs: ${response.status}`);
    }
    return response.json();
  }

  async getPVCById(namespace: string, name: string): Promise<PVC | null> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.getPVCById(namespace, name);
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pvcs/${namespace}/${name}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch PVC: ${response.status}`);
    }
    return response.json();
  }

  // AutoScaler Methods
  async getAllAutoScalers(): Promise<AutoScaler[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.getAllAutoScalers();
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/autoscalers`);
    if (!response.ok) {
      throw new Error(`Failed to fetch autoscalers: ${response.status}`);
    }
    return response.json();
  }

  async getAutoScalerById(id: string): Promise<AutoScaler | null> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.getAutoScalerById(id);
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/autoscalers/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch autoscaler: ${response.status}`);
    }
    return response.json();
  }

  async createAutoScaler(data: InsertAutoScaler): Promise<AutoScaler> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.createAutoScaler(data);
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/autoscalers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create autoscaler: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteAutoScaler(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.deleteAutoScaler(id);
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/autoscalers/${id}`, {
      method: 'DELETE'
    });
    
    if (response.status === 404) {
      return false;
    }
    if (!response.ok) {
      throw new Error(`Failed to delete autoscaler: ${response.status}`);
    }
    
    return true;
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.getHealth();
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }

  // Real-time updates
  onPVCUpdates(callback: (pvcs: PVC[]) => void): () => void {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.onPVCUpdates(callback);
    }
    
    // For real API, use WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${API_CONFIG.BASE_URL.replace(/^https?:\/\//, '')}/api/ws`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected to real API');
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'pvc-update') {
              callback(message.data);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...');
          reconnectTimeout = window.setTimeout(connect, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
      }
    };
    
    connect();
    
    // Return cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }

  // Configuration methods
  setMockMode(enabled: boolean) {
    API_CONFIG.USE_MOCK = enabled;
  }

  isMockMode() {
    return API_CONFIG.USE_MOCK;
  }
}

export const apiService = new ApiService();