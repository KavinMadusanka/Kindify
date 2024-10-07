import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  Modal,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../config/FirebaseConfig'; // Import your Firebase configuration
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'; // Import Firebase Firestore methods

const UserIcon = require('../../assets/images/User.png');
const EmailIcon = require('../../assets/images/Email.png');
const AddressIcon = require('../../assets/images/Home Address.png');
const CallIcon = require('../../assets/images/Call.png');

const ProfileScreen = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // State to hold user data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]); // State to hold categories

  // States for updates
  const [updatedName, setUpdatedName] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedContact, setUpdatedContact] = useState('');
  const [updatedCategories, setUpdatedCategories] = useState(''); // New state for updated categories

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

          // Set categories if available
          setCategories(userDoc.category || []); // Assuming 'category' is an array in Firestore
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

  // Loading state while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render the profile if userData is available
  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User data not found.</Text>
      </View>
    );
  }

  // Update user data in Firestore
  const handleUpdate = async () => {
    if (!userData) return; // Do not proceed if userData is not available

    try {
      const userDocRef = doc(db, 'users', userData.id); // Get the user document reference

      // Prepare the data to update
      const updates = {};
      if (updatedName) updates.firstName = updatedName; // Only update if not empty
      if (updatedAddress) updates.Address = updatedAddress;
      if (updatedContact) updates.Contact = updatedContact;
      if (updatedCategories) updates.category = updatedCategories.split(',').map(cat => cat.trim()); // Convert string to array

      // Check if there are updates to make
      if (Object.keys(updates).length > 0) {
        // Update the user document in Firestore
        await updateDoc(userDocRef, updates);

        // Update local state to reflect changes
        setUserData((prev) => ({
          ...prev,
          ...updates,
        }));

        // Show success message
        Alert.alert('Success', 'Your details updated successfully.');
      } else {
        Alert.alert('No Changes', 'No updates were made.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update your details. Please try again.');
    }
  };

  const openUpdateForm = () => {
    // Populate the input fields with current user data
    setUpdatedName(userData.firstName);
    setUpdatedAddress(userData.Address);
    setUpdatedContact(userData.Contact);
    setUpdatedCategories(categories.join(', ')); // Populate categories as a comma-separated string
    setModalVisible(true);
  };

  const handleSubmit = () => {
    handleUpdate();
    setModalVisible(false); // Close modal after handling update
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Image and Name */}
      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={{
            uri: userData.profileImage || 'https://your-default-image-url.com',
          }}
        />
        <Text style={styles.profileName}>{userData.firstName}</Text>
      </View>

      {/* Personal Info */}
      <View style={styles.infoCard}>
        <Image source={UserIcon} style={styles.icon} />
        <Text style={styles.infoText}>{userData.firstName}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={EmailIcon} style={styles.icon} />
        <Text style={styles.infoText}>{userData.emailAddress}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={AddressIcon} style={styles.icon} />
        <Text style={styles.infoText}>{userData.Address}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={CallIcon} style={styles.icon} />
        <Text style={styles.infoText}>{userData.Contact}</Text>
      </View>

      {/* Categories fetched from database */}
      <Text style={styles.sectionTitle}>Preferred Volunteer Categories</Text>
      <View style={styles.categoriesContainer}>
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <Text key={index} style={styles.categoryItem}>
              {category}
            </Text>
          ))
        ) : (
          <Text>No categories found.</Text>
        )}
      </View>

      {/* Update Button */}
      <Button title="Update Your Information" onPress={openUpdateForm} />

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Update Your Information</Text>
          <Text style={styles.modalTitlee}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={updatedName}
            onChangeText={setUpdatedName}
          />
          <Text style={styles.modalTitlee}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={updatedAddress}
            onChangeText={setUpdatedAddress}
          />
          <Text style={styles.modalTitlee}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact"
            value={updatedContact}
            onChangeText={setUpdatedContact}
            keyboardType="phone-pad"
          />
          <Text style={styles.modalTitlee}>Prefered volunteer categories</Text>
          <TextInput
            style={styles.inputt}
            placeholder="Categories (comma-separated)"
            value={updatedCategories}
            onChangeText={setUpdatedCategories}
          />
          <View style={styles.modalButtonContainer}>
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E5E4',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F7F6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
    width: 40,
    height: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#000',
  },
  categoriesContainer: {
    backgroundColor: '#F3F7F6',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  categoryItem: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: 350,
  },
  inputt: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: 350,
    height:100
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#D5E5E4',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'black',
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  modalTitlee: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
});

export default ProfileScreen;
