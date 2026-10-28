import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import { useColors } from './theme';

type SymbolName = Exclude<SymbolViewProps['name'], string>;

// rtl: "forward" chevrons point left and "back" chevrons point right
const ICONS = {
  home: { ios: 'house.fill', android: 'home' },
  close: { ios: 'xmark', android: 'close' },
  check: { ios: 'checkmark', android: 'check' },
  forward: { ios: 'chevron.left', android: 'chevron_left' },
  back: { ios: 'chevron.right', android: 'chevron_right' },
  bookmark: { ios: 'bookmark', android: 'bookmark' },
  bookmarked: { ios: 'bookmark.fill', android: 'bookmark_added' },
  flag: { ios: 'flag', android: 'flag' },
  flagged: { ios: 'flag.fill', android: 'flag' },
  flame: { ios: 'flame.fill', android: 'local_fire_department' },
  timer: { ios: 'timer', android: 'timer' },
  formula: { ios: 'function', android: 'functions' },
  zoom: { ios: 'arrow.up.left.and.arrow.down.right', android: 'zoom_in' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  bell: { ios: 'bell.fill', android: 'notifications' },
  target: { ios: 'target', android: 'target' },
  book: { ios: 'book.closed.fill', android: 'menu_book' },
  report: { ios: 'exclamationmark.bubble', android: 'report' },
  info: { ios: 'info.circle', android: 'info' },
  appearance: { ios: 'circle.lefthalf.filled', android: 'contrast' },
  textSize: { ios: 'textformat.size', android: 'format_size' },
  haptics: { ios: 'iphone.radiowaves.left.and.right', android: 'vibration' },
  trash: { ios: 'trash', android: 'delete' },
  grid: { ios: 'square.grid.3x3.fill', android: 'grid_view' },
  checkCircle: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  wrongCircle: { ios: 'xmark.circle.fill', android: 'cancel' },
  chart: { ios: 'chart.bar.fill', android: 'bar_chart' },
  clock: { ios: 'clock', android: 'schedule' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome' },
  replay: { ios: 'arrow.counterclockwise', android: 'replay' },
  code: { ios: 'chevron.left.forwardslash.chevron.right', android: 'code' },
  trophy: { ios: 'trophy.fill', android: 'emoji_events' },
  exam: { ios: 'doc.text.fill', android: 'assignment' },
  stopwatch: { ios: 'stopwatch.fill', android: 'timer' },
  scope: { ios: 'scope', android: 'target' },
  bolt: { ios: 'bolt.fill', android: 'bolt' },
  verbal: { ios: 'text.book.closed.fill', android: 'menu_book' },
  quantitative: { ios: 'x.squareroot', android: 'functions' },
  lightbulb: { ios: 'lightbulb.fill', android: 'lightbulb' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
};

export function Icon({ name, size = 20, color, weight = 'semibold' }: Props) {
  const colors = useColors();
  return <SymbolView name={ICONS[name]} size={size} tintColor={color ?? colors.text} weight={weight} />;
}
