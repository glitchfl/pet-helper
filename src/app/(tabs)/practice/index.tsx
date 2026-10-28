import { router } from 'expo-router';
import { ListRow, ListSection } from '@/ui/List';
import { ScrollScreen } from '@/ui/Screen';
import { DOMAIN_NAMES } from '@/ui/strings';
import { useColors } from '@/ui/theme';

export default function PracticeScreen() {
  const colors = useColors();

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
    </ScrollScreen>
  );
}
