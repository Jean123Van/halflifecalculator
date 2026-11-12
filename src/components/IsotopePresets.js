// src/components/IsotopePresets.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PRESET_ISOTOPES } from '../utils/calculator';

export default function IsotopePresets({ onSelectPreset }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Common Radioactive Isotopes Presets:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PRESET_ISOTOPES.map((iso, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.pill}
            onPress={() => onSelectPreset(iso)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillName}>{iso.name}</Text>
            <Text style={styles.pillDetail}>
              t₁/₂ = {iso.halfLife} {iso.unit}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  heading: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 10,
    gap: 8,
  },
  pill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  pillDetail: {
    color: '#38BDF8',
    fontSize: 11,
    marginTop: 2,
  },
});
