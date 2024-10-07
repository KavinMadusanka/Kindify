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
    'beach-cleaning': require('../../assets/images/Beach.png'),
    'elderly-care': require('../../assets/images/eldery care.png'),
    'food-security-&-distribution': require('../../assets/images/Food Donor.png'),
    'fundraising-events': require('../../assets/images/Events.png'),
    'blood-donation': require('../../assets/images/Drop Of Blood.png'),
    'disaster-relief': require('../../assets/images/Devastating.png'),
    'teaching-tutoring': require('../../assets/images/teaching.png'),
    'animal-welfare-shelter-support': require('../../assets/images/Animal Shelter.png'),
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
    };

    const closeSuccessModal = () => {
        setSuccessModalVisible(false);
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
                            <Text style={styles.goalText}>{item.category.replace(/-/g, ' ')}</Text>
                            <Text style={styles.goalText}>{item.targetHours} hours in {item.month} Month</Text>
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
                                <Picker.Item label="Beach Cleaning" value="beach-cleaning" />
                                <Picker.Item label="Elderly Care" value="elderly-care" />
                                <Picker.Item label="Food Security & Distribution" value="food-security-&-distribution" />
                                <Picker.Item label="Fundraising Events" value="fundraising-events" />
                                <Picker.Item label="Blood Donation" value="blood-donation" />
                                <Picker.Item label="Disaster Relief" value="disaster-relief" />
                                <Picker.Item label="Teaching & Tutoring" value="teaching-&-tutoring" />
                                <Picker.Item label="Animal Welfare & Shelter Support" value="animal-welfare-shelter-support" />
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
                                <Picker.Item label="January" value="january" />
                                <Picker.Item label="February" value="february" />
                                <Picker.Item label="March" value="march" />
                                <Picker.Item label="April" value="april" />
                                <Picker.Item label="May" value="may" />
                                <Picker.Item label="June" value="june" />
                                <Picker.Item label="July" value="july" />
                                <Picker.Item label="August" value="august" />
                                <Picker.Item label="September" value="september" />
                                <Picker.Item label="October" value="october" />
                                <Picker.Item label="November" value="november" />
                                <Picker.Item label="December" value="december" />
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
                        <Text>Your goal has been added successfully.</Text>

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