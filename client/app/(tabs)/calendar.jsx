import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user management
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars'; // Import the Calendar component
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration

const MonthlyActivityCalendar = () => {
  const { user } = useUser(); // Fetch current user's info from Clerk
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true); // To show a loading state
  const [eventDetails, setEventDetails] = useState([]); // To store event categories

  // Function to fetch and process activities
  const fetchActivities = async () => {
    try {
      const currentUserEmail = user?.primaryEmailAddress?.emailAddress; // Get email from Clerk user object

      if (!currentUserEmail) {
        console.log('User email not available');
        setLoading(false);
        return;
      }

      // Firestore query to get user's joined events
      const q = query(
        collection(db, 'JoinEvent'),
        where('eventdData.emailAddress', '==', currentUserEmail) // Filter by user's email
      );

      const querySnapshot = await getDocs(q);
      const eventDates = {};
      const eventCategoryDetails = []; // Array to store event categories

      // Process the data from Firestore
      querySnapshot.forEach((doc) => {
        const data = doc.data().eventdData; // Access the eventdData map

        // Assuming 'data.date' is in a format that can be parsed by new Date()
        const eventDate = new Date(data.date); // Convert the string date to a Date object

        // Adjusting the date to UTC and formatting it to YYYY-MM-DD
        const formattedDate = eventDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD

        // Check if the eventDate is valid
        if (!isNaN(eventDate.getTime())) {
          // Mark the date with a special mark
          eventDates[formattedDate] = {
            marked: true,
            dotColor: 'blue', // Choose your preferred color
            // Additional properties can be added
          };

          // Store event category details
          eventCategoryDetails.push({
            date: formattedDate,
            category: data.category, // Extracting the category
            hours: data.hours, // Store additional details if needed
          });
        } else {
          console.error(`Invalid date for document ID ${doc.id}: ${data.date}`);
        }
      });

      setMarkedDates(eventDates);
      setEventDetails(eventCategoryDetails); // Store event categories
      setLoading(false); // Stop loading spinner
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false); // Stop loading spinner in case of error
    }
  };

  useEffect(() => {
    fetchActivities(); // Fetch data when component loads
  }, [user]); // Refetch if user changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004F2D" />
        <Text>Loading your activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Activity Calendar</Text>
      <Calendar
        // Set the current date (optional)
        current={new Date().toISOString().split('T')[0]}
        // Set marked dates
        markedDates={markedDates}
        // Add additional calendar properties if needed
      />
      <View style={styles.eventListContainer}>
        <Text style={styles.eventListTitle}>Event Categories:</Text>
        {eventDetails.map((event, index) => (
          <Text key={index} style={styles.eventText}>
            Date: {event.date}, Category: {event.category}, Hours: {event.hours}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E5E4',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventListContainer: {
    marginTop: 20,
  },
  eventListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MonthlyActivityCalendar;
