import { type PVC, type AutoScaler, type InsertAutoScaler } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for Volumania data
export interface IStorage {
  // PVC operations
  getAllPVCs(): Promise<PVC[]>;
  getPVC(id: string): Promise<PVC | undefined>;
  getPVCByName(name: string, namespace: string): Promise<PVC | undefined>;
  
  // AutoScaler operations
  getAllAutoScalers(): Promise<AutoScaler[]>;
  getAutoScaler(id: string): Promise<AutoScaler | undefined>;
  createAutoScaler(autoScaler: InsertAutoScaler): Promise<AutoScaler>;
  updateAutoScaler(id: string, autoScaler: Partial<AutoScaler>): Promise<AutoScaler | undefined>;
  deleteAutoScaler(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private pvcs: Map<string, PVC>;
  private autoScalers: Map<string, AutoScaler>;

  constructor() {
    this.pvcs = new Map();
    this.autoScalers = new Map();
  }

  async getAllPVCs(): Promise<PVC[]> {
    return Array.from(this.pvcs.values());
  }

  async getPVC(id: string): Promise<PVC | undefined> {
    return this.pvcs.get(id);
  }

  async getPVCByName(name: string, namespace: string): Promise<PVC | undefined> {
    return Array.from(this.pvcs.values()).find(
      (pvc) => pvc.name === name && pvc.namespace === namespace,
    );
  }

  async getAllAutoScalers(): Promise<AutoScaler[]> {
    return Array.from(this.autoScalers.values());
  }

  async getAutoScaler(id: string): Promise<AutoScaler | undefined> {
    return this.autoScalers.get(id);
  }

  async createAutoScaler(insertAutoScaler: InsertAutoScaler): Promise<AutoScaler> {
    const id = randomUUID();
    const autoScaler: AutoScaler = {
      ...insertAutoScaler,
      id,
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    this.autoScalers.set(id, autoScaler);
    return autoScaler;
  }

  async updateAutoScaler(id: string, updates: Partial<AutoScaler>): Promise<AutoScaler | undefined> {
    const existing = this.autoScalers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.autoScalers.set(id, updated);
    return updated;
  }

  async deleteAutoScaler(id: string): Promise<boolean> {
    return this.autoScalers.delete(id);
  }
}

export const storage = new MemStorage();
