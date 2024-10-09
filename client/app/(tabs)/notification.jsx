import { useEffect, useState } from 'react';
import { query, collection, where, onSnapshot, addDoc, getDocs } from 'firebase/firestore'; // Firestore methods
import { db } from '../../config/FirebaseConfig'; // Firebase config
import { View, Text, FlatList, StyleSheet } from 'react-native'; // Use React Native components

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Set up a query for blood donation events with status 'accept'
    const q = query(
      collection(db, 'joinEvent'),
      where('eventdData.status', '==', 'accept'),
      where('eventdData.category', '==', 'blood donation')
    );

    // Listen for real-time updates on the query
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        const eventData = doc.data();
        handleNotification(eventData);
      });
    });

    // Fetch and display existing notifications
    fetchNotifications();

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Handle new notifications
  const handleNotification = (eventData) => {
    const nextDonationDate = new Date(eventData.joinedAt);
    nextDonationDate.setMonth(nextDonationDate.getMonth() + 3); // Add 3 months

    const notificationMessage = `You can donate blood again on ${nextDonationDate.toDateString()}`;

    // Save this notification in the database
    saveNotification(notificationMessage, eventData.joinedAt);
  };

  // Function to save notification to the database
  const saveNotification = async (message, receivedAt) => {
    await addDoc(collection(db, 'notifications'), {
      message: message,
      receivedAt: receivedAt,
    });
    fetchNotifications(); // Refresh notifications after saving
  };

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    const notificationsData = notificationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotifications(notificationsData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.receivedAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notification: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  message: {
    fontSize: 16,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});

export default Notification;