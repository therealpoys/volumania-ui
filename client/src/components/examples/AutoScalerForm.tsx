import AutoScalerForm from '../AutoScalerForm';
import type { InsertAutoScaler } from '@shared/schema';

export default function AutoScalerFormExample() {
  const handleSubmit = (data: InsertAutoScaler) => {
    console.log('AutoScaler created:', data);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  return (
    <div className="p-4 flex justify-center">
      <AutoScalerForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        pvcName="postgres-data"
        namespace="production"
      />
    </div>
  );
}