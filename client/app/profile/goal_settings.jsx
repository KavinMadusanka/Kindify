import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Switch, Button, FlatList, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import Icon from '@expo/vector-icons/MaterialIcons';
import { db } from '../../config/FirebaseConfig';  // Import your firebase configuration
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo'; // Import useUser hook

// Import your images
const images = {
    'Beach-cleaning': require('../../assets/images/Beach.png'),
    'Elderly-care': require('../../assets/images/eldery care.png'),
    'Food-security-&-distribution': require('../../assets/images/Food Donor.png'),
    'Fundraising-events': require('../../assets/images/Events.png'),
    'Blood-donation': require('../../assets/images/Drop Of Blood.png'),
    'Disaster-relief': require('../../assets/images/Devastating.png'),
    'Teaching-tutoring': require('../../assets/images/teaching.png'),
    'Animal-welfare-shelter-support': require('../../assets/images/Animal Shelter.png'),
};

const App = () => {
    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const [modalVisible, setModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [goals, setGoals] = useState([]);
    const [category, setCategory] = useState('');
    const [month, setMonth] = useState('');
    const [targetHours, setTargetHours] = useState(0);
    const [remindersEnabled, setRemindersEnabled] = useState(false);

    // Fetch goals from Firestore when the component mounts
    useEffect(() => {
        const goalsRef = collection(db, "goals");
        const q = query(goalsRef, where("userEmail", "==", userEmail));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const goalsData = [];
            querySnapshot.forEach((doc) => {
                goalsData.push({ id: doc.id, ...doc.data() });
            });
            setGoals(goalsData);
        });

        return () => unsubscribe();
    }, [userEmail]);

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        resetForm(); // Clear the form when closing the modal
    };

    const closeSuccessModal = () => {
        setSuccessModalVisible(false);
    };

    const resetForm = () => {
        setCategory('');
        setMonth('');
        setTargetHours(0);
        setRemindersEnabled(false);
    };

    const submitGoal = async () => {
        // Validate inputs before saving
        if (!category || !month || targetHours <= 0) {
            alert("Please fill in all fields correctly.");
            return;
        }

        // Prepare the reminder time (for simplicity, let's set it to the first day of the month)
        const reminderDate = new Date();
        reminderDate.setMonth(new Date().getMonth() + 1); // Next month
        reminderDate.setDate(1); // First day of the next month
        reminderDate.setHours(9); // Set reminder time (e.g., 9 AM)

        // Save goal to Firestore
        try {
            await addDoc(collection(db, "goals"), {
                userEmail,
                category,
                month,
                targetHours,
                remindersEnabled,
                createdAt: new Date(),
                reminderDate: remindersEnabled ? reminderDate : null, // Save reminder date if enabled
            });
            closeModal();
            setSuccessModalVisible(true);
        } catch (error) {
            console.error("Error saving goal: ", error);
        }

        resetForm(); // Clear the form after submission
    };

    const getCurrentAndFutureMonths = () => {
        const currentMonth = new Date().getMonth();
        const months = [
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
        ];

        // Only return months from the current one onward
        return months.slice(currentMonth);
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <Text style={styles.subHeader}>Set Your Goals For Month</Text>

            {/* Add new goal button */}
            <TouchableOpacity style={styles.addGoalButton} onPress={openModal}>
                <Text style={styles.addGoalText}>Add new goal</Text>
                <Icon name="add-circle-outline" size={30} color="black" />
            </TouchableOpacity>

            {/* Goals List */}
            <Text style={styles.goalsHeader}>Your Existing Goals:</Text>
            <FlatList
                data={goals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.goalItem}>
                        {/* Display image based on the category */}
                        <Image source={images[item.category]} style={styles.goalImage} />
                        <View style={styles.goalTextContainer}>
                            <Text style={styles.goalText}>{item.category.replace(/-/g, ' ')} in {item.month} Month</Text>
                            <Text style={styles.goalText}>{item.targetHours} hours</Text>
                        </View>
                    </View>
                )}
            />

            {/* Popup Modal for Goal Setting */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Set New Goal</Text>

                        {/* Close Button */}
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>

                        {/* Category Picker Box */}
                        <Text>Select Category</Text>
                        <View style={styles.pickerBox}>
                            <Picker
                                selectedValue={category}
                                style={styles.picker}
                                onValueChange={(itemValue) => setCategory(itemValue)}
                            >
                                <Picker.Item label="Select category" value="" />
                                <Picker.Item label="Beach Cleaning" value="Beach-cleaning" />
                                <Picker.Item label="Elderly Care" value="Elderly-care" />
                                <Picker.Item label="Food Security & Distribution" value="Food-security-&-distribution" />
                                <Picker.Item label="Fundraising Events" value="Fundraising-events" />
                                <Picker.Item label="Blood Donation" value="Blood-donation" />
                                <Picker.Item label="Disaster Relief" value="Disaster-relief" />
                                <Picker.Item label="Teaching & Tutoring" value="Teaching-tutoring" />
                                <Picker.Item label="Animal Welfare & Shelter Support" value="Animal-welfare-shelter-support" />
                            </Picker>
                        </View>

                        {/* Month Picker Box */}
                        <Text>Select Month</Text>
                        <View style={styles.pickerBox}>
                            <Picker
                                selectedValue={month}
                                style={styles.picker}
                                onValueChange={(itemValue) => setMonth(itemValue)}
                            >
                                <Picker.Item label="Select month" value="" />
                                {getCurrentAndFutureMonths().map((monthName, index) => (
                                    <Picker.Item key={index} label={monthName} value={monthName} />
                                ))}
                            </Picker>
                        </View>

                        {/* Target Hours Slider */}
                        <Text>Target Hours: {targetHours}</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={20}
                            step={1}
                            value={targetHours}
                            onValueChange={(value) => setTargetHours(value)}
                        />

                        {/* Enable Reminders Switch */}
                        <View style={styles.reminderRow}>
                            <Text>Enable Reminders</Text>
                            <Switch
                                value={remindersEnabled}
                                onValueChange={(value) => setRemindersEnabled(value)}
                            />
                        </View>

                        {/* Submit Button */}
                        <Button title="Save Goal" onPress={submitGoal} />
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={successModalVisible}
                onRequestClose={closeSuccessModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.successTitle}>Success!</Text>
                        <Text style={{ marginBottom: 20 }}>Your goal has been added successfully.</Text>

                        {/* Close Button */}
                        <Button title="Close" onPress={closeSuccessModal} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#E7EFEF',
  },
  subHeader: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: 'bold',
  },
  addGoalButton: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      borderColor: '#ccc',
      borderWidth: 1,
  },
  addGoalText: {
      fontSize: 16,
  },
  goalsHeader: {
      fontSize: 17,
      fontWeight: 'bold',
      marginTop: 20,
  },
  goalItem: {
      paddingBottom:20,
      paddingTop:20,
      paddingLeft:10,
      marginVertical: 5,
      backgroundColor: '#fff',
      borderRadius: 20,
      borderColor: '#ccc',
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
  },
  goalTextContainer: {
      marginLeft: 10,
  },
  goalText: {
      fontSize: 15,
  },
  goalImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
  },
  modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '90%',
      maxHeight: 500,
      justifyContent: 'center',
      position: 'relative',
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
  },
  successTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
  },
  closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
  },
  pickerBox: {
      height: 50,
      backgroundColor: '#f9f9f9',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginBottom: 15,
      justifyContent: 'center',
  },
  picker: {
      height: 30,
      width: '100%',
  },
  slider: {
      width: '100%',
      height: 40,
      marginBottom: 15,
  },
  reminderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
});

export default App;