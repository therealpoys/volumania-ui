import UsageBar from '../UsageBar';

export default function UsageBarExample() {
  return (
    <div className="space-y-6 p-4 max-w-md">
      <UsageBar usagePercent={25} size="sm" />
      <UsageBar usagePercent={60} size="md" />
      <UsageBar usagePercent={85} size="lg" />
      <UsageBar usagePercent={95} size="md" />
    </div>
  );
}