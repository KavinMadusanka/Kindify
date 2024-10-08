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
  Switch,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const UserIcon = require('../../assets/images/User.png');
const EmailIcon = require('../../assets/images/Email.png');
const AddressIcon = require('../../assets/images/Home Address.png');
const CallIcon = require('../../assets/images/Call.png');

const ProfileScreen = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [updatedName, setUpdatedName] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedContact, setUpdatedContact] = useState('');
  const [updatedCategories, setUpdatedCategories] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const availableCategories = [
    'Beach Clean',
    'Elderly Care',
    'Food Security & Distribution',
    'Fundraising Events',
    'Blood Donation',
    'Disaster Relief',
    'Teaching & Tutoring',
    'Animal Welfare & Shelter Support',
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userEmail) {
          console.error('No email found for the logged-in user.');
          return;
        }

        const userQuery = query(
          collection(db, 'users'),
          where('emailAddress', '==', userEmail)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserData({ ...userDoc, id: querySnapshot.docs[0].id });
          setCategories(userDoc.category || []);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User data not found.</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!userData) return;

    try {
      const userDocRef = doc(db, 'users', userData.id);
      const updates = {};
      if (updatedName) updates.firstName = updatedName;
      if (updatedAddress) updates.Address = updatedAddress;
      if (updatedContact) updates.Contact = updatedContact;
      if (updatedCategories.length > 0) updates.category = updatedCategories;

      if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates);
        setUserData((prev) => ({
          ...prev,
          ...updates,
        }));
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
    setUpdatedName(userData.firstName);
    setUpdatedAddress(userData.Address);
    setUpdatedContact(userData.Contact);
    setUpdatedCategories(categories);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    handleUpdate();
    setModalVisible(false);
  };

  const handleCategoryChange = (category) => {
    if (updatedCategories.includes(category)) {
      setUpdatedCategories(updatedCategories.filter((cat) => cat !== category));
    } else {
      setUpdatedCategories([...updatedCategories, category]);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const userDocRef = doc(db, 'users', userData.id);
              await deleteDoc(userDocRef);
              Alert.alert('Success', 'Your account has been deleted successfully.');
              // Redirect to login screen or home (implement navigation as needed)
            } catch (error) {
              console.error('Error deleting user data:', error);
              Alert.alert('Error', 'Failed to delete your account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
      <Image
          style={styles.profileImage}
          source={{ uri: user?.imageUrl || 'https://your-image-url' }} // User's profile image or fallback
          onError={() => console.log('Error loading image')} // Handle image load error
        />
        <Text style={styles.profileName}>{userData.firstName}</Text>
      </View>

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

      <View style={styles.buttonContainer}>
        <Button title="Update Your Information" onPress={openUpdateForm} />
      </View>

      <View style={styles.bContainer}>
        <Button title="Delete Account" color="red" onPress={handleDeleteAccount} />
      </View>

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            <Text style={styles.modalTitlee}>Preferred volunteer categories</Text>
            {availableCategories.map((category) => (
              <View key={category} style={styles.checkboxContainer}>
                <Switch
                  value={updatedCategories.includes(category)}
                  onValueChange={() => handleCategoryChange(category)}
                />
                <Text style={styles.categoryLabel}>{category}</Text>
              </View>
            ))}
            <View style={styles.modalButtonContainer}>
              <Button title="Submit" onPress={handleSubmit} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </ScrollView>
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
    width: 120,
    height: 120,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
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
  buttonContainer: {
    marginVertical: 10,
  },
  bContainer: {
    marginVertical: 10,
    marginBottom: 40,
  },
});

export default ProfileScreen;