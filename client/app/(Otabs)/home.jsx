import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TextInput, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration
import { Link } from 'expo-router'; // For navigation

const AllMyEvents = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events')); // Adjust your collection path
    const eventsData = [];
    querySnapshot.forEach((doc) => {
      eventsData.push({ id: doc.id, ...doc.data() });
    });
    setEvents(eventsData);
    setFilteredEvents(eventsData);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter((event) =>
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  // Render event card
  const renderEventCard = ({ item }) => (
    <View style={styles.card}>
      {item.images && item.images.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.eventImage} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.eventTitle}>{item.category} Program</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        {/* Navigate to event details page */}
        <Link
          href={`/OmoreDeatils/eventdescription?id=${item.id}`} // Pass the event ID in the URL
          style={styles.moreDetailsButton}
        >
          <Text style={styles.moreDetailsText}>More Details</Text>
        </Link>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by Category..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      {/* Event List */}
      <FlatList
        data={filteredEvents}
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
    backgroundColor: '#E9EFEC', // Main background color
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25, // Rounded edges for the search bar
    margin: 15,
    borderColor: '#C4DAD2', // Light green border
    borderWidth: 1,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow effect for the card
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
    color: '#333', // Darker text for readability
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
    backgroundColor: '#C4DAD2', // Button color as per design
    padding: 10,
    borderRadius: 20, // Rounded button style
    alignItems: 'center',
    marginTop: 10,
    width: '50%',
  },
  moreDetailsText: {
    color: '#333',
    fontSize: 16,
  },
});
