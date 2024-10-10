import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

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

  // Function to calculate the next donation date
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

          if (
            data.eventdData &&
            data.eventdData.category === 'Blood Donation' &&
            data.eventdData.status === 'accept' &&
            eventEmail === userEmail
          ) {
            const nextDonationDate = calculateNextDonationDate(data.eventdData.date);

            const notification = {
              id: change.doc.id,
              category: data.eventdData.category,
              date: data.eventdData.date,
              nextDonationDate: nextDonationDate,
              receivedAt: new Date().toString(),
            };

            // Add notification to the state
            setNotifications(prevNotifications => [notification, ...prevNotifications]);

            // Save the notification to AsyncStorage
            saveNotificationToStorage(notification);

            // Trigger local notification
            showLocalNotification(
              "Event Accepted",
              `You have been accepted for a ${data.eventdData.category} on ${data.eventdData.date}. Your next eligible donation date is ${nextDonationDate}.`
            );
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userEmail]);

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>
              You have been accepted for a {item.category} event on {item.date}. Your next eligibility donation date is {item.nextDonationDate}. You can again donate your blood after {item.nextDonationDate}.
            </Text>
            <Text style={styles.receivedAtText}>Received at: {item.receivedAt}</Text>
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
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2, // Android shadow
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
