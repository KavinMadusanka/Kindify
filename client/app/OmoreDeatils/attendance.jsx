import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { db } from '../../config/FirebaseConfig';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const Attendance = () => {
  const route = useRoute();
  const { id } = route.params || {}; // Get event ID from route parameters
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingUsers = async () => {
    console.log('Event ID:', id);
    try {
      const q = query(collection(db, 'JoinEvent'));
      const querySnapshot = await getDocs(q);
      const usersEmails = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventdData?.status === 'pendding' && data.eventdData?.eventId === id) {
          const email = data.eventdData?.emailAddress;
          if (email) { // Ensure email is defined and not empty
            usersEmails.push(email); // Store email
          }
        }
      });

      console.log('Fetched Emails:', usersEmails);
      const uniqueEmails = [...new Set(usersEmails)]; // Remove duplicates

      if (uniqueEmails.length > 0) {
        const usersQuery = query(collection(db, 'users'), where('emailAddress', 'in', uniqueEmails));
        const usersSnapshot = await getDocs(usersQuery);
        const users = [];

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          users.push({
            id: userDoc.id,
            firstName: userData.firstName || 'Unknown User',
            emailAddress: userData.emailAddress,
          });
        });

        console.log('Fetched User Names:', users);
        setPendingUsers(users);
      } else {
        console.log('No valid emails found.');
        setPendingUsers([]); // No users to show
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId, status) => {
    const userRef = doc(db, 'JoinEvent', userId);
    try {
      await updateDoc(userRef, {
        'eventdData.status': status,
      });
      Alert.alert('Success', `User status updated to ${status}`);
      fetchPendingUsers();
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  useEffect(() => {
    if (id) {
      fetchPendingUsers();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error fetching users: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Confirmation</Text>
      {pendingUsers.length === 0 ? (
        <Text>No pending users found.</Text>
      ) : (
        pendingUsers.map((user) => (
          <View key={user.id} style={styles.cardContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.firstName}</Text>
              <Text style={styles.userEmail}>{user.emailAddress.toLowerCase()}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={() => updateStatus(user.id, 'accept')}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.absentButton]} onPress={() => updateStatus(user.id, 'reject')}>
                <Text style={styles.buttonText}>Absent</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E9EFEC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFCCCC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', // Center the title
  },
  cardContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align buttons to the right
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#6A9C89', // Confirm button color
  },
  absentButton: {
    backgroundColor: '#FF8770', // Absent button color
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default Attendance;
