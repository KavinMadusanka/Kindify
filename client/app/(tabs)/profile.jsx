import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { query, collection, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore'; // Firestore methods
import { db } from '../../config/FirebaseConfig'; // Firebase config
import * as ImagePicker from 'expo-image-picker'; // Import Image Picker
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icon

// Import images
const Customer = require('../../assets/images/Customer.png');
const Goal = require('../../assets/images/Goal.png');
const Reminders = require('../../assets/images/Reminders.png');
const Bookmark = require('../../assets/images/Bookmark.png');
const Notification = require('../../assets/images/Notification.png');

const Profile = () => {
  // Get the user data from Clerk
  const { user } = useUser();
  const { signOut } = useAuth();
  const userEmail = user?.primaryEmailAddress?.emailAddress; // Get current user's email

  // Local state to hold Firestore data
  const [firstName, setFirstName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false); // Loading state for image upload

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userEmail) {
          // Create a Firestore query to fetch the document where the email matches the current user's email
          const usersCollection = collection(db, 'users');
          const q = query(usersCollection, where('emailAddress', '==', userEmail)); // Ensure this matches your Firestore field name
          const querySnapshot = await getDocs(q);

          // Check if the query returned any documents
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              setFirstName(userData.firstName); // Fetch firstName from Firestore
            });
          } else {
            console.log('No matching document found.');
          }
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
      }
    };

    const fetchProfileImage = async () => {
      if (userEmail) {
        const imageDocRef = doc(db, 'profileImages', userEmail);
        const docSnapshot = await getDoc(imageDocRef); // Use getDoc instead of getDocs

        if (docSnapshot.exists()) {
          const imageData = docSnapshot.data();
          if (imageData.profileImageUrl) {
            setProfileImage(imageData.profileImageUrl); // Set the fetched profile image
          }
        }
      }
    };

    fetchUserData(); // Fetch user data when the component mounts
    fetchProfileImage(); // Fetch profile image
  }, [userEmail]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission to access camera roll is required!');
        return;
      }

      if (imageUploading) {
        Alert.alert('Image is still uploading. Please wait.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Ensuring square image
        quality: 1,
      });

      if (result.canceled) {
        console.log('User cancelled image picker');
        return; // Early exit if user cancels
      }

      if (result.assets && result.assets.length > 0) {
        const pickedImageUri = result.assets[0]?.uri; // Safely access uri

        if (!pickedImageUri) {
          console.error('No image URI found');
          Alert.alert('No image selected. Please try again.');
          return;
        }

        setImageUploading(true); // Set loading state

        // Convert image to Base64
        const response = await fetch(pickedImageUri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64data = reader.result; // Base64 image string
          setProfileImage(base64data); // Set the profile image preview

          // Store the image and user email in Firestore
          const imageDocRef = doc(db, 'profileImages', userEmail); // Create a document with the user's email
          await setDoc(imageDocRef, {
            userEmail: userEmail, // Store user email
            profileImageUrl: base64data // Store the profile image URL
          }); // Update or create the document

          Alert.alert('Profile picture uploaded successfully!');
        };
        reader.readAsDataURL(blob);
      } else {
        console.error('No image selected');
        Alert.alert('Failed to select an image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false); // Remove loading state
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(); // Call the signOut method to log out
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Menu array for navigation options
  const Menu = [
    {
      id: 1,
      name: 'Personal Info',
      icon: Customer,
      path: '/profile/personal_info',
    },
    {
      id: 2,
      name: 'Monthly Goal Settings',
      icon: Goal,
      path: '/profile/goal_settings',
    },
    {
      id: 3,
      name: 'Reminders',
      icon: Reminders,
      path: '/profile/reminders',
    },
    {
      id: 4,
      name: 'Achievements',
      icon: Bookmark,
      path: '/profile/achievements',
    },
    {
      id: 5,
      name: 'Notifications',
      icon: Notification,
      path: 'notification',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Image and Name */}
      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.profileImage}
            source={{ uri: profileImage || user?.imageUrl || 'https://your-image-url' }} // User's profile image or fallback
            onError={() => console.log('Error loading image')} // Handle image load error
          />
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Icon name="photo-camera" size={30} color="#007bff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>
          {firstName || 'Your Name'}  {/* First name from Firestore */}
        </Text>
        <Text style={styles.profileEmail}>
          {user?.primaryEmailAddress?.emailAddress || 'Email not available'} {/* Email from Clerk */}
        </Text>
      </View>

      {/* Map through the menu array to create the cards dynamically */}
      {Menu.map((item) => (
        <Link href={item.path} key={item.id} style={styles.card}>
          <Image source={item.icon} style={styles.icon} />
          <Text style={styles.cardText}>{item.name}</Text>
        </Link>
      ))}

      {/* Log Out Button at the Bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E5E4',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    position: 'relative', // Enable absolute positioning for the icon
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular image
    borderWidth: 2,
    borderColor: '#FFF', // White border
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000', // Black text
  },
  profileEmail: {
    fontSize: 16,
    marginTop: 5,
    color: '#666', // Grey text
  },
  iconButton: {
    position: 'absolute',
    bottom: 3, // Adjust to position it below the image
    right: -10, // Position it to the right of the image
  },
  card: {
    flexDirection: 'row', // Icon and text side by side
    backgroundColor: '#F3F7F6', // Card background
    borderRadius: 20,
    paddingTop: 5,
    paddingBottom: 25,
    paddingLeft: 15,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Shadow for Android
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 30, // Space between icon and text
  },
  cardText: {
    fontSize: 17,
    color: '#000', // Black text
    marginLeft: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d', // Red button for logout
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF', // White text
  },
});

export default Profile;