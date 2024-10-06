import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';

// Import images
const Customer = require('../../assets/images/Customer.png');
const Goal = require('../../assets/images/Goal.png');
const Reminders = require('../../assets/images/Reminders.png');
const Bookmark = require('../../assets/images/Bookmark.png');
const Notification = require('../../assets/images/Notification.png');

const Profile = () => {
  // Menu array for navigation options
  const Menu = [
    {
      id: 1,
      name: 'Personal Info',
      icon: Customer,
      path: '/profile/personal_info',  // Correct path
    },
    {
      id: 2,
      name: 'Monthly Goal Settings',
      icon: Goal,
      path: '/profile/goal_settings',  // Correct path
    },
    {
      id: 3,
      name: 'Reminders',
      icon: Reminders,
      path: '/profile/reminders',  // Correct path
    },
    {
      id: 4,
      name: 'Achievements',
      icon: Bookmark,
      path: '/profile/achievements',  // Correct path
    },
    {
      id: 5,
      name: 'Notifications',
      icon: Notification,
      path: 'notification',  // Correct path
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={{ uri: 'https://your-image-url' }} // Replace with your image URL or asset
        />
        <Text style={styles.profileName}>Your Name</Text>
      </View>

      {/* Map through the menu array to create the cards dynamically */}
      {Menu.map((item) => (
        <Link href={item.path} key={item.id} style={styles.card}>
          <Image source={item.icon} style={styles.icon} />
          <Text style={styles.cardText}>{item.name}</Text>
        </Link>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E5E4', // background color
    paddingHorizontal: 20, // Added more horizontal padding for better spacing
    paddingTop: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30, // Adjusted for more space
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // To make it circular
    borderWidth: 2,
    borderColor: '#FFF', // Added white border to the image for a better look
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000', // Black text for profile name
  },
  card: {
    flexDirection: 'row', // Ensures image and text are side by side
    backgroundColor: '#F3F7F6', // Light background color for the card
    borderRadius: 20,
    paddingTop:5,
    paddingBottom:25,
    paddingLeft:15,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // For better shadow on Android
  },
  icon: {
    width: 40, // Adjusted size based on icon
    height: 40,
    marginRight: 30, // Space between icon and text
  },
  cardText: {
    fontSize: 17,
    color: '#000', // Black text
    marginLeft:20,
  },
});

export default Profile;
