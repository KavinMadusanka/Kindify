import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Import your Firebase configuration

const AllMyEvents = ({ navigation }) => {
  const [events, setEvents] = useState([]);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events')); // Adjust collection path as necessary
    const eventsData = [];
    querySnapshot.forEach((doc) => {
      eventsData.push({ id: doc.id, ...doc.data() });
    });
    setEvents(eventsData);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Render event card
  const renderEventCard = ({ item }) => (
    <View style={styles.card}>
    {/* Display the first image in the images array */}
    {item.images && item.images.length > 0 && (
      <Image source={{ uri: item.images[0] }} style={styles.eventImage} />
    )}
    <View style={styles.cardContent}>
      <Text style={styles.eventTitle}>{item.category} Program</Text>
      <Text style={styles.eventLocation}>{item.location}</Text>
      <Text style={styles.eventDate}>{item.date}</Text>
      <TouchableOpacity
        style={styles.moreDetailsButton}
        onPress={() => navigation.navigate('EventDetails', { eventId: item.id })} // Navigating to event details page
      >
        <Text style={styles.moreDetailsText}>More Details</Text>
      </TouchableOpacity>
    </View>
  </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default AllMyEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    flexDirection: 'row',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  moreDetailsButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  moreDetailsText: {
    color: '#fff',
    fontSize: 16,
  },
});
