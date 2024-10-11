import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons'; // Import Icon

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // Request notification permission
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Notification permissions are required to receive notifications.');
      }
    }
  };

  // Load notifications from AsyncStorage
  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications)); // Set state with loaded notifications
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotificationToStorage = async (notification) => {
    try {
      const currentNotifications = await AsyncStorage.getItem('notifications');
      const updatedNotifications = currentNotifications ? JSON.parse(currentNotifications) : [];
      updatedNotifications.push(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notification to storage:', error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    loadNotifications(); // Load notifications when the component mounts
  }, []);

  // Function to display local notification
  const showLocalNotification = async (title, body) => {
    try {
      console.log('Triggering notification with title:', title, 'and body:', body);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Function to calculate the next donation date for Blood Donation category
  const calculateNextDonationDate = (dateString) => {
    const donationDate = new Date(dateString);
    const nextDonationDate = new Date(donationDate);
    nextDonationDate.setDate(donationDate.getDate() + 56);
    return nextDonationDate.toDateString();
  };

  useEffect(() => {
    const joinEventRef = collection(db, 'JoinEvent');

    const unsubscribe = onSnapshot(joinEventRef, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          const eventEmail = data.eventdData?.emailAddress;

          // Debugging: Log the event data to check what's being received
          console.log("Event data:", data);

          if (data.eventdData && eventEmail === userEmail) {
            let notification;
            const eventDate = data.eventdData.date;

            // Check if the category is 'Blood Donation' and the status is 'accept'
            if (data.eventdData.category === 'Blood Donation' && data.eventdData.status === 'accept') {
              const nextDonationDate = calculateNextDonationDate(eventDate);

              notification = {
                id: change.doc.id,
                category: data.eventdData.category,
                date: eventDate,
                nextDonationDate: nextDonationDate,
                receivedAt: new Date().toString(),
              };

              // Trigger local notification for Blood Donation
              showLocalNotification(
                "Event Accepted",
                `You have been accepted for a ${data.eventdData.category} on ${eventDate}. Your next eligible donation date is ${nextDonationDate}.`
              );

            // Handle other categories where status is 'accept'
            } else if (data.eventdData.status === 'accept') {
              notification = {
                id: change.doc.id,
                category: data.eventdData.category,
                date: eventDate,
                receivedAt: new Date().toString(),
              };

              // Debugging: Log the notification for other categories
              console.log("Non-blood donation notification:", notification);

              // Trigger local notification for other categories
              showLocalNotification(
                "Event Accepted",
                `You have been accepted to participate in a ${data.eventdData.category} event on ${eventDate}.`
              );
            }

            // If a notification is created, save and display it
            if (notification) {
              // Add notification to the state
              setNotifications(prevNotifications => [notification, ...prevNotifications]);

              // Save the notification to AsyncStorage
              saveNotificationToStorage(notification);
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userEmail]);

  // Function to format date and time separately
  const formatReceivedDate = (receivedAt) => {
    const date = new Date(receivedAt);
    return date.toLocaleDateString();
  };

  const formatReceivedTime = (receivedAt) => {
    const date = new Date(receivedAt);
    return date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationContainer}>
            {/* Display notification icon */}
            <MaterialIcons name="notifications" size={24} color="black" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.notificationText}>
                You have been accepted for a {item.category} event on {item.date}.
                {item.category === 'Blood Donation' && ` Your next eligible donation date is ${item.nextDonationDate}.`}
              </Text>
              <Text style={styles.receivedAtText}>Received on: {formatReceivedDate(item.receivedAt)}</Text>
              <Text style={styles.receivedAtText}>Time: {formatReceivedTime(item.receivedAt)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={notifications.length === 0 && styles.emptyContainer} // Optional styling when no notifications
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E7EFEF',
  },
  notificationContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2, // Android shadow
  },
  icon: {
    marginRight: 10, // Space between icon and text
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    marginBottom: 4,
  },
  receivedAtText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;