// src/components/ResultCard.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatValue } from '../utils/calculator';

export default function ResultCard({ result }) {
  const [showSteps, setShowSteps] = useState(false);

  if (!result || !result.success) return null;

  const { details, summary, formula, steps, type } = result;
  const percentRemaining = details?.percentRemaining ?? 0;
  const percentDecayed = details?.percentDecayed ?? 0;

  return (
    <View style={styles.container}>
      {/* Header Badge */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {type === 'single_solved'
              ? 'CALCULATION COMPLETE'
              : type === 'partial_ratio' || type === 'partial_cycles'
              ? 'PARTIAL SOLUTION'
              : 'VERIFICATION'}
          </Text>
        </View>
      </View>

      {/* Main Solved Summary */}
      <Text style={styles.summaryText}>{summary}</Text>

      {/* Formula Box */}
      {formula ? (
        <View style={styles.formulaBox}>
          <Text style={styles.formulaLabel}>Applied Equation:</Text>
          <Text style={styles.formulaText}>{formula}</Text>
        </View>
      ) : null}

      {/* Progress Bar (Visual Decay Percentage) */}
      {details && details.percentRemaining !== undefined && (
        <View style={styles.visualSection}>
          <View style={styles.visualLabels}>
            <Text style={styles.visualLabelLeft}>
              Remaining: {formatValue(percentRemaining)}%
            </Text>
            <Text style={styles.visualLabelRight}>
              Decayed: {formatValue(percentDecayed)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(0, Math.min(100, percentRemaining))}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Derived Metrics Grid */}
      {details && (
        <View style={styles.metricsGrid}>
          {details.elapsedHalfLives !== undefined && (
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Half-Lives Elapsed (n)</Text>
              <Text style={styles.metricValue}>
                {formatValue(details.elapsedHalfLives)} cycles
              </Text>
            </View>
          )}

          {details.decayConstant !== undefined && (
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Decay Constant (λ)</Text>
              <Text style={styles.metricValue}>
                {formatValue(details.decayConstant)} {details.decayConstantUnit}
              </Text>
            </View>
          )}

          {details.meanLifetime !== undefined && (
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Mean Lifetime (τ)</Text>
              <Text style={styles.metricValue}>
                {formatValue(details.meanLifetime)} {details.meanLifetimeUnit}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Steps Toggle */}
      {steps && steps.length > 0 && (
        <View style={styles.stepsContainer}>
          <TouchableOpacity
            style={styles.stepsToggle}
            onPress={() => setShowSteps(!showSteps)}
            activeOpacity={0.7}
          >
            <Text style={styles.stepsToggleText}>
              {showSteps ? 'Hide Step-by-Step Breakdown ▲' : 'Show Step-by-Step Breakdown ▼'}
            </Text>
          </TouchableOpacity>

          {showSteps && (
            <View style={styles.stepsList}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepBullet}>•</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  summaryText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  formulaBox: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  formulaLabel: {
    color: '#94A3B8',
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  formulaText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  visualSection: {
    marginBottom: 14,
  },
  visualLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  visualLabelLeft: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
  },
  visualLabelRight: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metricItem: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: 140,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 3,
  },
  metricValue: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
  stepsContainer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  stepsToggle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  stepsToggleText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  stepsList: {
    marginTop: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stepBullet: {
    color: '#38BDF8',
    fontSize: 14,
    marginRight: 6,
  },
  stepText: {
    color: '#E2E8F0',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
