import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { Domain } from '@/bank/types';
import { usePracticeEngine } from '@/practice/PracticeProvider';
import { ListRow, ListSection } from '@/ui/List';
import { ScrollScreen } from '@/ui/Screen';
import { DOMAIN_NAMES, focusName } from '@/ui/strings';
import { useColors } from '@/ui/theme';

const SHOWN_FOCUSES = 3;

function mistakeCount(count: number) {
  if (count === 0) return 'אין טעויות';
  return count === 1 ? 'טעות אחת' : `${count} טעויות`;
}

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
  const mistakesOf = useCallback(
    () => ({ verbal: engine.progress('verbal').mistakes, quantitative: engine.progress('quantitative').mistakes }),
    [engine],
  );
  const [mistakes, setMistakes] = useState(mistakesOf);

  useFocusEffect(
    useCallback(() => {
      setMistakes(mistakesOf());
    }, [mistakesOf]),
  );

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
      <ListSection title="תרגול טעויות" footer="רק השאלות שטעיתם בהן, עד שלא נשארת אף אחת.">
        <ListRow
          title={DOMAIN_NAMES.verbal}
          subtitle={mistakeCount(mistakes.verbal)}
          icon="replay"
          iconColor={colors.verbal}
          onPress={
            mistakes.verbal > 0
              ? () => router.push({ pathname: '/session', params: { domain: 'verbal', mode: 'mistakes' } })
              : undefined
          }
        />
        <ListRow
          title={DOMAIN_NAMES.quantitative}
          subtitle={mistakeCount(mistakes.quantitative)}
          icon="replay"
          iconColor={colors.quantitative}
          onPress={
            mistakes.quantitative > 0
              ? () => router.push({ pathname: '/session', params: { domain: 'quantitative', mode: 'mistakes' } })
              : undefined
          }
        />
      </ListSection>
    </ScrollScreen>
  );
}
