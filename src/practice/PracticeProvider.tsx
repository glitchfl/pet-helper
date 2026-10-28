import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { questionBank } from '@/bank';
import { createPracticeEngine, type PracticeEngine } from '@/engine/practice-engine';
import { useColors } from '@/ui/theme';
import { openSqliteResponseStore } from './sqlite-response-store';

const PracticeContext = createContext<PracticeEngine | null>(null);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const colors = useColors();
  const [engine, setEngine] = useState<PracticeEngine>();

  useEffect(() => {
    openSqliteResponseStore()
      .then((store) => createPracticeEngine({ bank: questionBank, store, clock: Date.now, random: Math.random }))
      .then(setEngine);
  }, []);

  if (!engine) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <PracticeContext.Provider value={engine}>{children}</PracticeContext.Provider>;
}

export function usePracticeEngine(): PracticeEngine {
  const engine = useContext(PracticeContext);
  if (!engine) throw new Error('usePracticeEngine must be used inside PracticeProvider');
  return engine;
}
