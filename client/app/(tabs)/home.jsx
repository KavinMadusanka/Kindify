import { View, Text, Button, ScrollView, Image, FlatList, TextInput, StyleSheet, Pressable, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { addDoc, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';

export default function home() {
  const { signOut } = useAuth();  // Get the signOut method from Clerk
  const { isSignedIn } = useAuth();
  const [event, setEvent] = useState(null);
  const { user } = useUser();
  const [userData, setUserData] = useState([]);
  const [status, setStatus] = useState("pendding")
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  const fetchUserData = async () => {
    try {
      // if (!emailAddress) {
      //   console.error('No email found for the logged-in user.');
      //   return;
      // }

      // Create a query to find the user by email
      const userQuery = query(
        collection(db, 'users'), // Replace 'users' with your collection name
        where('emailAddress', '==', userEmail) // Adjust this based on your Firestore structure
      );

      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setUserData({ ...userDoc, id: querySnapshot.docs[0].id }); // Add document ID for updates
      } else {
        console.log('No such user document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } 
    fetchUserData();
  };

  // Fetch events from Firestore
  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events')); // Adjust your collection path
    const eventsData = [];
    querySnapshot.forEach((doc) => {
      eventsData.push({ id: doc.id, ...doc.data() });
    });
    setEvents(eventsData);
    setFilteredEvents(eventsData);
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);
  // useEffect(() => {
    
// }, [userEmail, isSignedIn]);

  useEffect(() => {
    if (searchQuery === '') {
      const filtered = events.filter((event) =>{
        const eventCategory = event.category ? event.category.toLowerCase() : '';
        const userCategories = Array.isArray(userData.category) 
          ? userData.category.map((category) => category.toLowerCase()) 
          : [];
      // Check if the event category is included in the user's selected categories
      return userCategories.includes(eventCategory);
      }
      );
      setFilteredEvents(filtered);
    } else {
      const filtered = events.filter((event) => {
        const searchCategory = searchQuery.toLowerCase();
        const eventCategory = event.category ? event.category.toLowerCase() : '';
        const eventName = event.name ? event.name.toLowerCase() : '';
        const userCategories = Array.isArray(userData.category) 
          ? userData.category.map((category) => category.toLowerCase()) 
          : [];

          return ( userCategories.includes(eventCategory) && (eventCategory.includes(searchCategory) || eventName.includes(searchCategory)));
          // return userCategories.includes(searchCategory);
      }
        // event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  // useEffect(() => {
  //   const filteredEvents = events.filter((event) => {
  //     const searchCategory = searchQuery ? searchQuery.toLowerCase() : '';
  //     const userCategories = Array.isArray(userData.category)
  //       ? userData.category.map((category) => category.toLowerCase())
  //       : [];
      
  //     const eventCategory = event.category ? event.category.toLowerCase() : '';
  //     const eventName = event.name ? event.name.toLowerCase() : ''; // assuming 'name' is a property in event
  
  //     // Match event based on user categories or search query
  //     const isCategoryMatch = userCategories.includes(eventCategory);
  //     const isSearchMatch = searchCategory
  //       ? eventCategory.includes(searchCategory) || eventName.includes(searchCategory)
  //       : true;
  
  //     // Return true if either matches (category match or search match)
  //     return isCategoryMatch || isSearchMatch;
  //   });
  
  //   // Set the filtered events after filtering
  //   setFilteredEvents(filteredEvents);
  // }, [searchQuery, events, userData.category]);

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
        <Pressable
        onPress={() => fetchEventDetails(item.id)}
          // href={`/OmoreDeatils/eventdescription?id=${item.id}`} // Pass the event ID in the URL
          style={styles.moreDetailsButton}
        >
          <Text style={styles.moreDetailsText}>Join Event</Text>
        </Pressable>
      </View>
    </View>
  );

  const fetchEventDetails = async (id) => {
    if (id) {
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
        // JoinEvent(event);
      } else {
        console.log('No such document!');
      }
    }
  };

  useEffect(() => {
    if (event) {
      JoinEvent(event); // Call JoinEvent only when event data is available
    }
  }, [event]);

  const JoinEvent = async (eventData) => {
    try {
      // console.log(eventData);
      // console.log(userEmail);
      const eventdData = {category: eventData.category,
        emailAddress: userEmail,
        status: status,
        date: eventData.date,
        hours: eventData.volunteerHours, };
      await addDoc(collection(db, 'JoinEvent'), {eventdData,
        // userId: userId,     // Store the user ID
        joinedAt: new Date(), // Store the timestamp
      });
  
      // You can add more fields if needed, like event details, user details, etc.
      Alert.alert('Adding Event','Event added successful!');
      console.log('Successfully joined the event!');
    } catch (error) {
      console.error('Error joining the event: ', error);
    }
  };

  return (
    <View style={styles.container}>
    {/* Search Bar */}
    <TextInput
      style={styles.searchBar}
      placeholder="Search by Category..." 
      color='#16423C'
      value={searchQuery}
      onChangeText={(text) => setSearchQuery(text)}
    />

    {/* <ScrollView style={{ backgroundColor: "#C4DAD2", marginTop:50 }}> */}
        {/* Event List */}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.list}
        />
        {/* </ScrollView> */}
    </View>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C4DAD2', // Main background color
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  searchBar: {
    backgroundColor: '#E9EFEC',
    padding: 10,
    borderRadius: 25, // Rounded edges for the search bar
    margin: 15,
    color:'#16423C',
    borderColor: '#C4DAD2', // Light green border
    borderWidth: 1,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#E9EFEC',
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
    color:'#16423C',
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
