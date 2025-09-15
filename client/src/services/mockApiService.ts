import type { PVC, AutoScaler, InsertAutoScaler } from "@shared/schema";
import { mockPVCs, mockAutoScalers } from "./mockData";

// Mock API service that simulates backend API calls
class MockApiService {
  private pvcs: PVC[] = [...mockPVCs];
  private autoScalers: AutoScaler[] = [...mockAutoScalers];
  private isEnabled = true;

  // Enable/disable mock mode
  setMockMode(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isMockMode() {
    return this.isEnabled;
  }

  // Simulate network delay
  private async delay(ms: number = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // PVC Methods
  async getAllPVCs(): Promise<PVC[]> {
    await this.delay();
    return [...this.pvcs];
  }

  async getPVCById(namespace: string, name: string): Promise<PVC | null> {
    await this.delay();
    const pvc = this.pvcs.find(p => p.namespace === namespace && p.name === name);
    return pvc || null;
  }

  // AutoScaler Methods
  async getAllAutoScalers(): Promise<AutoScaler[]> {
    await this.delay();
    return [...this.autoScalers];
  }

  async getAutoScalerById(id: string): Promise<AutoScaler | null> {
    await this.delay();
    const autoScaler = this.autoScalers.find(as => as.id === id);
    return autoScaler || null;
  }

  async createAutoScaler(data: InsertAutoScaler): Promise<AutoScaler> {
    await this.delay();
    
    const newAutoScaler: AutoScaler = {
      id: `as-${Date.now()}`,
      ...data,
      status: "Active",
      lastScaleTime: undefined,
      createdAt: new Date().toISOString()
    };

    this.autoScalers.push(newAutoScaler);

    // Update corresponding PVC to have autoscaler
    const pvcIndex = this.pvcs.findIndex(p => 
      p.namespace === data.namespace && p.name === data.pvcName
    );
    if (pvcIndex !== -1) {
      this.pvcs[pvcIndex] = {
        ...this.pvcs[pvcIndex],
        hasAutoscaler: true
      };
    }

    return newAutoScaler;
  }

  async deleteAutoScaler(id: string): Promise<boolean> {
    await this.delay();
    
    const index = this.autoScalers.findIndex(as => as.id === id);
    if (index === -1) return false;

    const autoScaler = this.autoScalers[index];
    this.autoScalers.splice(index, 1);

    // Update corresponding PVC to not have autoscaler
    const pvcIndex = this.pvcs.findIndex(p => 
      p.namespace === autoScaler.namespace && p.name === autoScaler.pvcName
    );
    if (pvcIndex !== -1) {
      this.pvcs[pvcIndex] = {
        ...this.pvcs[pvcIndex],
        hasAutoscaler: false
      };
    }

    return true;
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    await this.delay(50);
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0-mock"
    };
  }

  // Simulate real-time updates for WebSocket
  onPVCUpdates(callback: (pvcs: PVC[]) => void): () => void {
    const interval = setInterval(() => {
      // Simulate small usage changes
      this.pvcs = this.pvcs.map(pvc => {
        const change = (Math.random() - 0.5) * 2; // ±1% change
        const newUsagePercent = Math.max(0, Math.min(100, pvc.usagePercent + change));
        const newUsedBytes = Math.floor((newUsagePercent / 100) * pvc.totalBytes);
        
        return {
          ...pvc,
          usagePercent: Math.round(newUsagePercent * 10) / 10,
          usedBytes: newUsedBytes
        };
      });
      
      callback([...this.pvcs]);
    }, 5000); // Update every 5 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

export const mockApiService = new MockApiService();