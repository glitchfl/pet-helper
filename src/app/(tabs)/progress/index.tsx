import { EmptyState } from '@/ui/EmptyState';
import { ScrollScreen } from '@/ui/Screen';

export default function ProgressScreen() {
  return (
    <ScrollScreen>
      <EmptyState icon="chart" title="עוד אין נתונים" message="אחרי כמה שאלות תראו כאן איפה אתם חזקים ומה כדאי לתרגל." />
    </ScrollScreen>
  );
}
