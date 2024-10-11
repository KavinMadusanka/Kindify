import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Modal, TouchableOpacity } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user management
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars'; // Import the Calendar component
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration

const MonthlyActivityCalendar = () => {
  const { user } = useUser(); // Fetch current user's info from Clerk
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true); // To show a loading state
  const [eventDetails, setEventDetails] = useState([]); // To store event categories
  const [selectedEvent, setSelectedEvent] = useState(null); // To track selected event
  const [isModalVisible, setModalVisible] = useState(false); // To control modal visibility

  // Load images for each category
  const categoryImages = {
    'Beach Clean': require('../../assets/images/beachcleanup.png'),
    'Blood Donation': require('../../assets/images/blood icon.jpg'),
    'Elderly Care': require('../../assets/images/eldery care.jpg'),
    'Food Security & Distribution': require('../../assets/images/food icon.png'),
    'Fundraising Events': require('../../assets/images/fundraising.png'),
    'Disaster Relief': require('../../assets/images/disaster.png'),
    'Teaching & Tutoring': require('../../assets/images/teaching.jpg'),
    'Animal Welfare & Shelter Support': require('../../assets/images/animal welfare.png'),
    // Add more categories and their respective image paths
  };

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

        const eventDate = new Date(data.date); // Convert the string date to a Date object
        const formattedDate = eventDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD

        // Check if the eventDate is valid
        if (!isNaN(eventDate.getTime())) {
          // Store the category image for the corresponding date
          eventDates[formattedDate] = {
            image: categoryImages[data.category], // Save image path based on category
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

  // Function to handle image click
  const handleImageClick = (date) => {
    const event = eventDetails.find((event) => event.date === date);
    if (event) {
      setSelectedEvent(event);
      setModalVisible(true); // Open modal with event details
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

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
      <Text style={styles.title}>My Calendar</Text>
      <Calendar
        current={new Date().toISOString().split('T')[0]}
        markedDates={markedDates}
        markingType={'custom'} // Use custom markers for images
        dayComponent={({ date }) => {
          const markedDate = markedDates[date.dateString];
          return (
            <TouchableOpacity onPress={() => handleImageClick(date.dateString)}>
              <View style={styles.dayContainer}>
                <Text style={styles.dateText}>{date.day}</Text>
                {markedDate?.image && (
                  <Image source={markedDate.image} style={styles.eventImage} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal for event details */}
      {selectedEvent && (
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <Text>Date: {selectedEvent.date}</Text>
              <Text>Category: {selectedEvent.category}</Text>
              <Text>Hours: {selectedEvent.hours}</Text>
              {/* Add category image to modal */}
              <Image
                source={categoryImages[selectedEvent.category]}
                style={styles.modalImage}
              />
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  dateText: {
    color: '#000',
  },
  eventImage: {
    width: 50,
    height: 50,
    position: 'absolute',
    bottom: -10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#004F2D',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default MonthlyActivityCalendar;
