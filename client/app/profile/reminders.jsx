import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../../config/FirebaseConfig';  // Import your firebase configuration
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo'; // Import useUser hook

const Reminders = () => {
    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const [reminders, setReminders] = useState([]);

    useEffect(() => {
        const goalsRef = collection(db, "goals");
        const q = query(goalsRef, where("userEmail", "==", userEmail));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const remindersData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Check if reminders are enabled and reminderDate exists
                if (data.remindersEnabled && data.reminderDate) {
                    remindersData.push({ id: doc.id, ...data });
                }
            });
            setReminders(remindersData);
        });

        return () => unsubscribe();
    }, [userEmail]);

    return (
        <View style={styles.container}>
            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.reminderItem}>
                      <Text style={styles.boldText}>Reminder: </Text>
                        <Text style={styles.reminderText}>
                            You have set a goal for {item.category.replace(/-/g, ' ')}: {item.targetHours} hours in {item.month}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E7EFEF',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    reminderItem: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    reminderText: {
        fontSize: 15,
    },
    boldText: {
      fontSize: 17,
      fontWeight: 'bold',
  },
});

export default Reminders;