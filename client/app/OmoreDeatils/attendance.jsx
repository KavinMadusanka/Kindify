import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, TouchableOpacity } from 'react-native';
import { db } from '../../config/FirebaseConfig';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const Attendance = () => {
  const route = useRoute();
  const { id } = route.params || {}; // Get event ID from route parameters
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      const q = query(collection(db, 'JoinEvent'));
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventdData?.status === 'pendding' && data.eventdData?.eventId === id) {
          users.push({ id: doc.id, firstName: data.eventdData.emailAddress });
        }
      });

      setPendingUsers(users);
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
      fetchPendingUsers(); // Refetch users to update the list
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
        <Text style={styles.noUsers}>No pending users found.</Text>
      ) : (
        pendingUsers.map((user) => (
          <View key={user.id} style={styles.userContainer}>
            <Text style={styles.userName}>{user.firstName}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => updateStatus(user.id, 'accept')}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.absentButton}
                onPress={() => updateStatus(user.id, 'reject')}
              >
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
    textAlign: 'center', // Center align the title
    marginBottom: 20,
  },
  noUsers: {
    textAlign: 'center',
    fontSize: 16,
  },
  userContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  userName: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Right-align buttons
  },
  confirmButton: {
    backgroundColor: '#6A9C89',
    padding: 10,
    borderRadius: 5,
    marginRight: 10, // Spacing between buttons
  },
  absentButton: {
    backgroundColor: '#FF8770',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Attendance;
