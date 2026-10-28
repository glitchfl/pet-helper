import { greeting } from '@/ui/strings';
import { TabStack } from '@/ui/TabStack';

export default function TodayLayout() {
  return <TabStack title={greeting(new Date())} />;
}
