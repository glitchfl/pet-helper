import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springs } from './motion';
import { useColors } from './theme';

type Props = {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function ProgressBar({ progress, color, trackColor, height = 6 }: Props) {
  const colors = useColors();
  const value = useSharedValue(clamp(progress));

  useEffect(() => {
    value.value = withSpring(clamp(progress), springs.gentle);
  }, [progress, value]);

  const fill = useAnimatedStyle(() => ({ width: `${value.value * 100}%` }));

  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor ?? colors.fill }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(progress) * 100) }}
    >
      <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color ?? colors.accent }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', alignItems: 'flex-start' },
});
