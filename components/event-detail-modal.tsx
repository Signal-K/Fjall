import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Launch } from '@/types';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface EventDetailModalProps {
  event: Launch | null;
  visible: boolean;
  onClose: () => void;
}

export default function EventDetailModal({ event, visible, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const renderDetail = (key: string, value: any) => {
    if (value === null || value === undefined) return null;

    if (typeof value === 'object') {
      return (
        <View key={key} style={styles.detailBlock}>
          <ThemedText style={styles.detailKey}>{key.replace(/_/g, ' ')}</ThemedText>
          <View style={styles.nestedDetails}>
            {Object.entries(value).map(([nestedKey, nestedValue]) => renderDetail(nestedKey, nestedValue))}
          </View>
        </View>
      );
    }

    return (
      <View key={key} style={styles.detailRow}>
        <ThemedText style={styles.detailKey}>{key.replace(/_/g, ' ')}:</ThemedText>
        <ThemedText style={styles.detailValue}>{String(value)}</ThemedText>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ScrollView>
            <ThemedText style={styles.modalTitle}>{event.name}</ThemedText>
            {Object.entries(event).map(([key, value]) => renderDetail(key, value))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <ThemedText style={styles.textStyle}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  detailBlock: {
    marginBottom: 10,
  },
  nestedDetails: {
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  detailKey: {
    fontWeight: 'bold',
    color: '#555',
    textTransform: 'capitalize',
  },
  detailValue: {
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: '#2986f5',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
