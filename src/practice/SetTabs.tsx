import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/ui/theme';

export type SetTab = 'set' | 'question';

type Props = {
  tab: SetTab;
  setLabel: string;
  questionLabel: string;
  onChange: (tab: SetTab) => void;
};

export function SetTabs({ tab, setLabel, questionLabel, onChange }: Props) {
  const colors = useColors();
  const tabs: { key: SetTab; label: string }[] = [
    { key: 'set', label: setLabel },
    { key: 'question', label: questionLabel },
  ];

  return (
    <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {tabs.map(({ key, label }) => {
        const active = key === tab;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.label, { color: active ? colors.onAccent : colors.text }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 3, marginHorizontal: 16, marginTop: 10 },
  tab: { flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600' },
});
