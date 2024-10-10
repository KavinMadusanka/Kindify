import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { doc, getDoc, deleteDoc } from 'firebase/firestore'; // Import deleteDoc
import { db } from '../../config/FirebaseConfig';
import { useRoute } from '@react-navigation/native';
import { Link } from 'expo-router';

const EventDescription = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [deleting, setDeleting] = useState(false); // State for handling deletion loading

  const route = useRoute();
  const { id } = route.params || {};

  const fetchEventDetails = async () => {
    if (id) {
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'events', id)); // Delete the event from Firebase
      setDeleting(false);
      setModalVisible(false); // Close the modal after deletion
      alert('Event deleted successfully!');
      // Optionally, navigate back or reset state
    } catch (error) {
      console.error('Error deleting document: ', error);
      setDeleting(false);
    }
  };

  if (!id) {
    return (
      <View style={styles.container}>
        <Text>Error: Event ID not provided.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>No event details available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Display event images */}
      {event.images && event.images.length > 0 && (
        <View style={styles.imageContainer}>
          {event.images.map((imageUrl, index) => (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={styles.eventImage}
            />
          ))}
        </View>
      )}

      {/* Grouped Event Information in one rounded container */}
      <View style={styles.eventDetailsContainer}>
        <Text style={styles.eventTitle}>{event.category} Program</Text>
        <Text style={styles.eventLocation}>Location: {event.location}</Text>
        <Text style={styles.eventDate}>Date: {event.date}</Text>
        <Text style={styles.eventTime}>Time: {event.time}</Text>
        <Text style={styles.volunteerHours}>Volunteer Hours: {event.volunteerHours}</Text>
        <Text style={styles.eventDescription}>Description: {event.description}</Text>
      </View>

      {/* Bottom button section (Edit, Delete, and Attendance buttons) */}
      <View style={styles.buttonContainer}>
        {/* Delete button opens confirmation modal */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.iconButton]}>
          <Text style={styles.iconText}>🗑️</Text>
        </TouchableOpacity>

        {/* Attendance Button */}
          <Link
            href={`./attendance?id=${event.id}`} // Pass event ID in the URL for the attendance
          >
            <View style={styles.attendanceButton}>
              <Text style={styles.buttonText}>Attendance</Text>
            </View>
          </Link>

        {/* Edit Button with navigation to update form */}
        <Link
          href={`./updateFormDetails?id=${event.id}`} // Pass event ID in the URL for the edit form
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>✏️</Text>
        </Link>
      </View>

      {/* Modal for delete confirmation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this event?</Text>

            {/* Delete confirmation buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.modalButtonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EventDescription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EFEC',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventImage: {
    width: '48%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#C4DAD2',
  },
  eventDetailsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventLocation: {
    fontSize: 18,
    color: '#555',
    marginVertical: 5,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 16,
    color: '#888',
    marginVertical: 5,
    textAlign: 'center',
  },
  eventTime: {
    fontSize: 16,
    color: '#888',
    marginVertical: 5,
    textAlign: 'center',
  },
  volunteerHours: {
    fontSize: 16,
    color: '#888',
    marginVertical: 5,
    textAlign: 'center',
  },
  eventDescription: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  iconText: {
    fontSize: 22,
    color: '#FFF',
  },
  attendanceButton: {
    backgroundColor: '#007b55',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
