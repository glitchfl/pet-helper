// the app is always laid out right to left, so moving forward means moving toward the left edge.
// transforms are physical, so every horizontal translation multiplies by this
export const FORWARD = -1;

export const springs = {
  press: { damping: 18, stiffness: 420, mass: 0.6 },
  release: { damping: 14, stiffness: 260, mass: 0.6 },
  snappy: { damping: 20, stiffness: 300, mass: 0.8 },
  gentle: { damping: 22, stiffness: 160, mass: 1 },
  pop: { damping: 9, stiffness: 320, mass: 0.6 },
};

export const durations = { fast: 160, base: 240, slow: 420 };
