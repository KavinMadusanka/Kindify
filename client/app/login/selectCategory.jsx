import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Button, Alert } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter  } from 'expo-router'
import { Checkbox } from 'react-native-paper';
import { db } from '../../config/FirebaseConfig'; // Make sure to import your Firebase configuration
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFonts } from 'expo-font';

export default function selectCategory() {
    const [fontsLoaded] = useFonts({
      'Outfit-Bold': require('../../assets/fonts/Outfit-Bold.ttf'),
    });

    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const router = useRouter()

    // State for modal visibility
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            if (!userEmail) {
              console.error('No email found for the logged-in user.');
              return;
            }
    
            // Create a query to find the user by email
            const userQuery = query(
              collection(db, 'users'), // Replace 'users' with your collection name
              where('emailAddress', '==', userEmail) // Adjust this based on your Firestore structure
            );
    
            const querySnapshot = await getDocs(userQuery);
    
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0].data();
              setUserData({ ...userDoc, id: querySnapshot.docs[0].id }); // Add document ID for updates
            } else {
              console.log('No such user document!');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserData();
      }, [userEmail]);

    const categories = [
        'Beach Clean',
        'Elderly Care',
        'Food Security & Distribution',
        'Fundraising Events',
        'Blood Donation',
        'Disaster Relief',
        'Teaching & Tutoring',
        'Animal Welfare & Shelter Support',
    ];
    const handleCheckboxPress = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(item => item !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleSubmit = () => {
        if(selectedCategories == null || selectedCategories.length === 0){
            Alert.alert('No preference selected', 'Need to select your preferences.');
            return;
        }
        handleUpdate();
        setModalVisible(false); // Close modal after handling update
      };

      // Update user data in Firestore
  const handleUpdate = async () => {
    if (!userData) return; // Do not proceed if userData is not available

    try {
      const userDocRef = doc(db, 'users', userData.id); // Get the user document reference

      // Prepare the data to update
      const updates = {};
      if (selectedCategories) updates.category = selectedCategories;

      // Check if there are updates to make
      if (Object.keys(updates).length > 0) {
        // Update the user document in Firestore
        await updateDoc(userDocRef, updates);

        // Update local state to reflect changes
        setUserData(prev => ({
          ...prev,
          ...updates,
        }));

        // Show success message
        router.replace('/(tabs)/home');
        Alert.alert('Success', 'Your preferences selected successfully.');
      } else {
        Alert.alert('No Changes', 'No preferences selected.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update your details. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#C4DAD2', paddingVertical: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <Image
                    source={require('../../assets/images/Logo.png')} // Make sure the image path is correct
                    style={{ width: 150, height: 150, marginBottom: 20 }}
                />
                <Text style={{ fontSize: 24, color: '#16423C', fontWeight: 'bold', marginBottom: 20 }}>
                    Select your preferences:
                </Text>
            </View>
            
            {categories.map((category, index) => (
                <Pressable
                    key={index}
                    onPress={() => handleCheckboxPress(category)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, width: '80%', backgroundColor: '#E9EFEC', padding: 10, borderRadius: 10 }}
                >
                    <Checkbox
                        status={selectedCategories.includes(category) ? 'checked' : 'unchecked'}
                        onPress={() => handleCheckboxPress(category)}
                        color="#16423C"
                    />
                    <Text style={{ fontSize: 18, color: '#16423C', marginLeft: 10 }}>
                        {category}
                    </Text>
                </Pressable>
            ))}

            <View style={styles.modalButtonContainer}>
                <Button title="Submit" onPress={handleSubmit} />
            </View>

            {/* You can add a Submit button or continue navigation button if needed */}
        </ScrollView>
  )
}

const styles = StyleSheet.create({

    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
      },

});
