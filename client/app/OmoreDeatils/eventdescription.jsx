import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; 
import { useRoute } from '@react-navigation/native';
import { Link } from 'expo-router'; // Import Link for navigation

const EventDescription = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <View style={styles.iconButton}>
          <Text style={styles.iconText}>🗑️</Text>
        </View>
        <View style={styles.attendanceButton}>
          <Text style={styles.buttonText}>Attendance</Text>
        </View>
        {/* Edit Button with navigation to update form */}
        <Link
          href={`./updateFormDetails?id=${event.id}`} // Pass event ID in the URL for the edit form
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>✏️</Text>
        </Link>
      </View>
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
    backgroundColor: '#FFF',  // White background for the event details section
    borderRadius: 15,         // Rounded edges for the whole group
    padding: 20,              // Padding inside the container
    marginVertical: 10,       // Spacing around the container
    shadowColor: '#000',      // Soft shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,             // Elevation for Android shadow effect
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
});
