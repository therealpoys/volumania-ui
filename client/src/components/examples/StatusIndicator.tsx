import StatusIndicator from '../StatusIndicator';

export default function StatusIndicatorExample() {
  return (
    <div className="space-y-4 p-4">
      <StatusIndicator status="Bound" />
      <StatusIndicator status="Active" />
      <StatusIndicator status="Pending" />
      <StatusIndicator status="Inactive" />
      <StatusIndicator status="Error" />
      <StatusIndicator status="Lost" />
    </div>
  );
}