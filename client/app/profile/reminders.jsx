import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { db } from '../../config/FirebaseConfig';  // Firebase config
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo'; // useUser hook from Clerk
import Icon from 'react-native-vector-icons/MaterialIcons';  // Import Material Icons

const Reminders = () => {
    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const [goalReminders, setGoalReminders] = useState([]);  // For goal reminders
    const [userReminders, setUserReminders] = useState([]);  // For user-added reminders
    const [newReminder, setNewReminder] = useState('');      // State for new reminder input
    const [editingReminder, setEditingReminder] = useState(null);  // Track the reminder being edited
    const [editedText, setEditedText] = useState('');        // State for edited reminder text

    // Fetch reminders from both "goals" and "userReminders" collections
    useEffect(() => {
        const goalsRef = collection(db, "goals");
        const userRemindersRef = collection(db, "userReminders");

        const qGoals = query(goalsRef, where("userEmail", "==", userEmail));
        const qUserReminders = query(userRemindersRef, where("userEmail", "==", userEmail));

        const unsubscribeGoals = onSnapshot(qGoals, (querySnapshot) => {
            const goalsData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.remindersEnabled && data.reminderDate) {
                    goalsData.push({ id: doc.id, ...data });
                }
            });
            setGoalReminders(goalsData);
        });

        const unsubscribeUserReminders = onSnapshot(qUserReminders, (querySnapshot) => {
            const userRemindersData = [];
            querySnapshot.forEach((doc) => {
                userRemindersData.push({ id: doc.id, text: doc.data().reminderText });
            });
            setUserReminders(userRemindersData);
        });

        return () => {
            unsubscribeGoals();
            unsubscribeUserReminders();
        };
    }, [userEmail]);

    // Function to add a new reminder to the "userReminders" collection
    const handleAddReminder = async () => {
        if (newReminder.trim() === '') return;

        try {
            await addDoc(collection(db, "userReminders"), {
                userEmail: userEmail,
                reminderText: newReminder,
                createdAt: new Date(),
            });
            setNewReminder(''); // Clear input field after adding
        } catch (error) {
            console.error("Error adding reminder: ", error);
        }
    };

    // Function to handle edit
    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder.id);  // Set the reminder being edited
        setEditedText(reminder.text);     // Set the initial value of the text to be edited
    };

    // Function to save edited reminder
    const handleSaveEdit = async (id) => {
        try {
            const reminderRef = doc(db, "userReminders", id);
            await updateDoc(reminderRef, {
                reminderText: editedText
            });
            setEditingReminder(null);  // Reset after saving
            setEditedText('');
        } catch (error) {
            console.error("Error updating reminder: ", error);
        }
    };

    // Function to confirm deletion
    const confirmDeleteReminder = (id) => {
        Alert.alert(
            'Delete Reminder',
            'Are you sure you want to delete this reminder?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteReminder(id) },
            ],
            { cancelable: true }
        );
    };

    // Function to delete a reminder
    const handleDeleteReminder = async (id) => {
        try {
            const reminderRef = doc(db, "userReminders", id);
            await deleteDoc(reminderRef);
        } catch (error) {
            console.error("Error deleting reminder: ", error);
        }
    };

    // Combine goalReminders and userReminders into sections for the SectionList
    const sections = [
        {
            title: 'Monthly Goal Reminders',
            data: goalReminders,
            renderItem: ({ item }) => (
                <View style={styles.reminderItem}>
                    <Image 
                        source={require('../../assets/images/Remin.png')} 
                        style={styles.image}  // Style the image
                    />
                    <Text style={styles.reminderText}>
                        You have set a goal {item.category.replace(/-/g, ' ')} {item.targetHours} hours in {item.month}
                    </Text>
                </View>
            ),
        },
        {
            title: 'Your Reminders',
            data: userReminders,
            renderItem: ({ item }) => (
                <View style={styles.reminderItem}>
                    <Image 
                        source={require('../../assets/images/Remin.png')} 
                        style={styles.image}  // Style the image
                    />
                    {editingReminder === item.id ? (
                        <TextInput
                            style={styles.input}
                            value={editedText}
                            onChangeText={setEditedText}
                        />
                    ) : (
                        <Text style={styles.reminderText}>{item.text}</Text>
                    )}

                    {/* Edit Button with Icon */}
                    <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={() => (editingReminder === item.id ? handleSaveEdit(item.id) : handleEditReminder(item))}>
                        <Icon name={editingReminder === item.id ? 'save' : 'edit'} size={24} color="#4CAF50" />
                    </TouchableOpacity>

                    {/* Delete Button with Icon */}
                    <TouchableOpacity style={styles.iconButton} onPress={() => confirmDeleteReminder(item.id)}>
                        <Icon name="delete" size={24} color="#F44336" />
                    </TouchableOpacity>
                </View>
            ),
        },
    ];

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionTitle}>{title}</Text>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No reminders available.</Text>}
            />

            {/* Add New Reminder Section */}
            <View style={styles.addReminderContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add New Reminder"
                    value={newReminder}
                    onChangeText={setNewReminder}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
                    <Text style={styles.addButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E7EFEF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'center',  
        padding: 14,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    reminderText: {
        fontSize: 14,
        flex: 1,  // Make text take available space
    },
    iconButton: {
        marginLeft: 10,
    },
    addReminderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#F1F1F1',
        paddingBottom:20,
        paddingTop:20,
        paddingRight:10,
        paddingLeft:10,
        borderRadius: 10,
        elevation: 2,
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 5,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#fff',
    },
    addButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#777',
        marginTop: 10,
    },
});

export default Reminders;