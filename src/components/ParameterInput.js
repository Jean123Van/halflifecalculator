// src/components/ParameterInput.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function ParameterInput({
  label,
  symbol,
  value,
  onChangeText,
  onClear,
  unit,
  unitOptions,
  onSelectUnit,
  placeholder = 'Leave empty to solve',
  isSolved = false,
  description,
  accentColor = '#06B6D4',
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.card, isSolved && styles.cardSolved]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={[styles.symbolBadge, { backgroundColor: accentColor + '20' }]}>
            <Text style={[styles.symbolText, { color: accentColor }]}>{symbol}</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>

        {isSolved && (
          <View style={styles.solvedBadge}>
            <Text style={styles.solvedBadgeText}>★ SOLVED</Text>
          </View>
        )}
      </View>

      {description ? (
        <Text style={styles.descriptionText}>{description}</Text>
      ) : null}

      {/* Input Row with Unit Button & Clear Button */}
      <View style={[styles.inputRow, isSolved && styles.inputRowSolved]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          returnKeyType="done"
          selectTextOnFocus
        />

        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClear}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}

        {unitOptions && unitOptions.length > 0 && (
          <TouchableOpacity
            style={styles.unitSelector}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.unitSelectorText}>{unit}</Text>
            <Text style={styles.unitSelectorArrow}>▾</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unit Selector Modal */}
      {unitOptions && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Unit for {symbol}</Text>
              <FlatList
                data={unitOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = item.value === unit;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.unitItem,
                        isSelected && styles.unitItemSelected,
                      ]}
                      onPress={() => {
                        onSelectUnit(item.value);
                        setModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.unitItemText,
                          isSelected && styles.unitItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardSolved: {
    borderColor: '#10B981',
    backgroundColor: '#0F291E',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symbolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  symbolText: {
    fontWeight: '700',
    fontSize: 13,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
  },
  solvedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  solvedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 48,
  },
  inputRowSolved: {
    borderColor: '#10B981',
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    paddingVertical: 8,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  unitSelectorText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },
  unitSelectorArrow: {
    color: '#38BDF8',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#475569',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  unitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  unitItemSelected: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  unitItemText: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  unitItemTextSelected: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  checkmark: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
