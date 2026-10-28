import { Image } from 'expo-image';
import { Image as NativeImage, StyleSheet, View } from 'react-native';
import { imageSource } from '@/bank';
import type { ImagePath } from '@/bank/types';

type Props = {
  examId: string;
  path: ImagePath;
  maxHeight?: number;
};

// figures are black-on-white crops so they always sit on a white card, even in dark mode
export function BankImage({ examId, path, maxHeight }: Props) {
  const source = imageSource(examId, path);
  const asset = NativeImage.resolveAssetSource(source);
  const aspectRatio = asset?.width && asset.height ? asset.width / asset.height : 4 / 3;

  return (
    <View style={styles.card}>
      <Image source={source} contentFit="contain" style={{ width: '100%', aspectRatio, maxHeight }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 8 },
});
