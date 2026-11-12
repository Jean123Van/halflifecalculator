// App.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ParameterInput from './src/components/ParameterInput';
import ResultCard from './src/components/ResultCard';
import IsotopePresets from './src/components/IsotopePresets';
import {
  solveHalfLife,
  TIME_UNITS,
  QUANTITY_UNITS,
  formatValue,
} from './src/utils/calculator';

export default function App() {
  // State for all 4 half-life parameters
  const [n0, setN0] = useState('100'); // Initial Quantity
  const [nt, setNt] = useState(''); // Remaining Quantity (empty by default to solve!)
  const [t, setT] = useState('11460'); // Elapsed Time
  const [th, setTh] = useState('5730'); // Half-Life (Carbon-14 default)

  // Units
  const [quantityUnit, setQuantityUnit] = useState('g');
  const [tUnit, setTUnit] = useState('yr');
  const [thUnit, setThUnit] = useState('yr');

  // Result and Error state
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [solvedField, setSolvedField] = useState(null);

  // Calculate logic
  const handleCalculate = () => {
    // Clear previous error
    setErrorMessage(null);

    const res = solveHalfLife({
      n0Str: n0,
      ntStr: nt,
      tStr: t,
      tUnit,
      thStr: th,
      thUnit,
      quantityUnit,
    });

    if (!res.success) {
      setErrorMessage(res.error);
      setResult(null);
      setSolvedField(null);
      return;
    }

    // If single field solved, auto-populate the solved value into state
    if (res.type === 'single_solved') {
      const formatted = res.solvedValueFormatted;
      setSolvedField(res.targetField);

      if (res.targetField === 'n0') setN0(formatted);
      if (res.targetField === 'nt') setNt(formatted);
      if (res.targetField === 't') setT(formatted);
      if (res.targetField === 'th') setTh(formatted);
    } else {
      setSolvedField(null);
    }

    setResult(res);
  };

  // Reset all fields
  const handleReset = () => {
    setN0('');
    setNt('');
    setT('');
    setTh('');
    setResult(null);
    setErrorMessage(null);
    setSolvedField(null);
  };

  // Load a quick example
  const handleLoadExample = () => {
    setN0('100');
    setNt(''); // Left blank to solve!
    setT('17190'); // 3 half-lives
    setTh('5730');
    setQuantityUnit('g');
    setTUnit('yr');
    setThUnit('yr');
    setResult(null);
    setErrorMessage(null);
    setSolvedField(null);
  };

  // Handle preset isotope selection
  const handleSelectPreset = (preset) => {
    setTh(preset.halfLife);
    setThUnit(preset.unit);
    if (tUnit === 's' && preset.unit === 'yr') {
      setTUnit('yr');
    }
  };

  // Count how many fields are currently empty
  const emptyCount = [n0, nt, t, th].filter((val) => val.trim() === '').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>⚛ NUCLEAR KINETICS</Text>
            </View>
            <Text style={styles.title}>Half-Life Calculator</Text>
            <Text style={styles.subtitle}>
              Leave the unknown field empty, then tap "Calculate" to solve it.
            </Text>
          </View>

          {/* Quick status pill */}
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              Empty fields: <Text style={styles.statusPillHighlight}>{emptyCount}</Text> of 4
              {emptyCount === 1 ? ' (Ready to solve target)' : ''}
              {emptyCount > 2 ? ' ⚠️ More than 2 empty' : ''}
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <View style={styles.errorTextContainer}>
                <Text style={styles.errorTitle}>Calculation Error</Text>
                <Text style={styles.errorBody}>{errorMessage}</Text>
              </View>
            </View>
          )}

          {/* Preset Isotopes */}
          <IsotopePresets onSelectPreset={handleSelectPreset} />

          {/* Input Section */}
          <View style={styles.section}>
            {/* 1. Initial Quantity */}
            <ParameterInput
              label="Initial Quantity (N₀)"
              symbol="N₀"
              value={n0}
              onChangeText={(val) => {
                setN0(val);
                if (solvedField === 'n0') setSolvedField(null);
              }}
              onClear={() => {
                setN0('');
                if (solvedField === 'n0') setSolvedField(null);
              }}
              unit={quantityUnit}
              unitOptions={QUANTITY_UNITS}
              onSelectUnit={setQuantityUnit}
              isSolved={solvedField === 'n0'}
              description="Original amount of radioactive substance before decay"
              accentColor="#38BDF8"
            />

            {/* 2. Remaining Quantity */}
            <ParameterInput
              label="Remaining Quantity (Nₜ)"
              symbol="Nₜ"
              value={nt}
              onChangeText={(val) => {
                setNt(val);
                if (solvedField === 'nt') setSolvedField(null);
              }}
              onClear={() => {
                setNt('');
                if (solvedField === 'nt') setSolvedField(null);
              }}
              unit={quantityUnit}
              unitOptions={QUANTITY_UNITS}
              onSelectUnit={setQuantityUnit}
              isSolved={solvedField === 'nt'}
              description="Amount of substance remaining after time t"
              accentColor="#10B981"
            />

            {/* 3. Elapsed Time */}
            <ParameterInput
              label="Elapsed Time (t)"
              symbol="t"
              value={t}
              onChangeText={(val) => {
                setT(val);
                if (solvedField === 't') setSolvedField(null);
              }}
              onClear={() => {
                setT('');
                if (solvedField === 't') setSolvedField(null);
              }}
              unit={tUnit}
              unitOptions={TIME_UNITS}
              onSelectUnit={setTUnit}
              isSolved={solvedField === 't'}
              description="Total time duration elapsed during decay"
              accentColor="#F59E0B"
            />

            {/* 4. Half-Life */}
            <ParameterInput
              label="Half-Life (t₁/₂)"
              symbol="t₁/₂"
              value={th}
              onChangeText={(val) => {
                setTh(val);
                if (solvedField === 'th') setSolvedField(null);
              }}
              onClear={() => {
                setTh('');
                if (solvedField === 'th') setSolvedField(null);
              }}
              unit={thUnit}
              unitOptions={TIME_UNITS}
              onSelectUnit={setThUnit}
              isSolved={solvedField === 'th'}
              description="Time required for half of the substance to decay"
              accentColor="#A855F7"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.calculateBtn}
              onPress={handleCalculate}
              activeOpacity={0.8}
            >
              <Text style={styles.calculateBtnText}>Calculate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Load Sample Example button */}
          <TouchableOpacity
            style={styles.exampleBtn}
            onPress={handleLoadExample}
            activeOpacity={0.7}
          >
            <Text style={styles.exampleBtnText}>⚡ Load Sample Problem (Carbon-14)</Text>
          </TouchableOpacity>

          {/* Results Display */}
          {result && <ResultCard result={result} />}

          {/* Footer Formula Reference Card */}
          <View style={styles.referenceCard}>
            <Text style={styles.refTitle}>📖 The Radioactive Decay Law</Text>
            <Text style={styles.refFormula}>N(t) = N₀ × (1/2)^(t / t₁/₂)</Text>
            <Text style={styles.refDescription}>
              Where N₀ is initial quantity, N(t) is remaining quantity, t is elapsed time, and
              t₁/₂ is the characteristic half-life of the isotope.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 14,
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 8,
  },
  headerBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  statusPill: {
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusPillText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statusPillHighlight: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#450A0A',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  errorBody: {
    color: '#FEE2E2',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  calculateBtn: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  resetBtnText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
  },
  exampleBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  exampleBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  referenceCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  refTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  refFormula: {
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  refDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
});
