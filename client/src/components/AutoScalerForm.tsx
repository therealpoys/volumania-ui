import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { insertAutoScalerSchema, type InsertAutoScaler } from "@shared/schema";

interface AutoScalerFormProps {
  onSubmit: (data: InsertAutoScaler) => void;
  onCancel: () => void;
  pvcName?: string;
  namespace?: string;
  isSubmitting?: boolean;
}

export default function AutoScalerForm({ 
  onSubmit, 
  onCancel, 
  pvcName = "", 
  namespace = "default",
  isSubmitting = false 
}: AutoScalerFormProps) {
  
  const form = useForm<InsertAutoScaler>({
    resolver: zodResolver(insertAutoScalerSchema),
    defaultValues: {
      name: pvcName ? `${pvcName}-autoscaler` : "",
      namespace: namespace,
      pvcName: pvcName,
      minSize: "10Gi",
      maxSize: "100Gi", 
      stepSize: "10Gi",
      triggerAbovePercent: 80,
      checkIntervalSeconds: 30,
      cooldownSeconds: 300,
    },
  });

  const handleSubmit = (data: InsertAutoScaler) => {
    console.log('AutoScaler form submitted:', data);
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl" data-testid="autoscaler-form">
      <CardHeader>
        <CardTitle>Create PVC AutoScaler</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure automatic scaling for your Persistent Volume Claim
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AutoScaler Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="namespace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Namespace</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-namespace" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="pvcName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PVC Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-pvc-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Scaling Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scaling Configuration</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="minSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Size</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10Gi" data-testid="input-min-size" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Size</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="100Gi" data-testid="input-max-size" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stepSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Size</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10Gi" data-testid="input-step-size" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="triggerAbovePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Above Usage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="100" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-trigger-percent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Timing Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Timing Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkIntervalSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="10" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-check-interval"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cooldownSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooldown (seconds)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="60" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-cooldown"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? "Creating..." : "Create AutoScaler"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}