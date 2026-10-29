import { router } from 'expo-router';
import { useMemo } from 'react';
import type { Domain } from '@/bank/types';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { ListRow, ListSection } from '@/ui/List';
import { ScrollScreen } from '@/ui/Screen';
import { DOMAIN_NAMES, focusName } from '@/ui/strings';
import { useColors } from '@/ui/theme';

const SHOWN_FOCUSES = 3;

export default function PracticeScreen() {
  const engine = usePracticeEngine();
  const colors = useColors();
  const focusPreview = useMemo(() => {
    const preview = (domain: Domain) => {
      const names = engine.focuses(domain).map(focusName);
      const shown = names.slice(0, SHOWN_FOCUSES).join(', ');
      return names.length > SHOWN_FOCUSES ? `${shown} ועוד` : shown;
    };
    return { verbal: preview('verbal'), quantitative: preview('quantitative') };
  }, [engine]);

  return (
    <ScrollScreen>
      <ListSection title="תרגול חופשי" footer="שאלות שעוד לא ראיתם קודם, אחר כך הטעויות שלכם.">
        <ListRow
          title={DOMAIN_NAMES.verbal}
          icon="verbal"
          iconColor={colors.verbal}
          onPress={() => router.push({ pathname: '/session', params: { domain: 'verbal' } })}
        />
        <ListRow
          title={DOMAIN_NAMES.quantitative}
          icon="quantitative"
          iconColor={colors.quantitative}
          onPress={() => router.push({ pathname: '/session', params: { domain: 'quantitative' } })}
        />
      </ListSection>
      <ListSection title="תרגול ממוקד" footer="בוחרים סוגי שאלות או נושאים, ומתרגלים רק אותם.">
        <ListRow
          title={DOMAIN_NAMES.verbal}
          subtitle={focusPreview.verbal}
          icon="scope"
          iconColor={colors.verbal}
          onPress={() => router.push({ pathname: '/drill', params: { domain: 'verbal' } })}
        />
        <ListRow
          title={DOMAIN_NAMES.quantitative}
          subtitle={focusPreview.quantitative}
          icon="scope"
          iconColor={colors.quantitative}
          onPress={() => router.push({ pathname: '/drill', params: { domain: 'quantitative' } })}
        />
      </ListSection>
    </ScrollScreen>
  );
}
