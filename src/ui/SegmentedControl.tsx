import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptics } from './haptics';
import { FORWARD, springs } from './motion';
import { Text } from './Text';
import { useColors } from './theme';

const PAD = 3;

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const colors = useColors();
  const [width, setWidth] = useState(0);
  const placed = useRef(false);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    if (segment === 0) return;
    const target = FORWARD * index * segment;
    // jump into place on the first layout, glide afterwards
    offset.value = placed.current ? withSpring(target, springs.snappy) : target;
    placed.current = true;
  }, [index, segment, offset]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: colors.fill }]}
      accessibilityRole="tablist"
    >
      {segment > 0 && (
        <Animated.View
          style={[styles.thumb, { width: segment, backgroundColor: colors.surfaceRaised, shadowColor: '#000' }, thumb]}
        />
      )}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (active) return;
              haptics.selection();
              onChange(option.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.segment}
          >
            <Text variant="subhead" weight={active ? '600' : '500'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 11, borderCurve: 'continuous', padding: PAD },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    start: PAD,
    borderRadius: 9,
    borderCurve: 'continuous',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 6 },
});
