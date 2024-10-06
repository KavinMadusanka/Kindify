import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
//import { Ionicons, MaterialIcons } from '@expo/vector-icons';
const User = require('../../assets/images/User.png');
const Email = require('../../assets/images/Email.png');
const Address = require('../../assets/images/Home Address.png');
const Call = require('../../assets/images/Call.png');

const ProfileScreen = () => {
  // Hardcoded details (replace with Firebase data later)
  const user = {
    name: 'Kavindya Fernando',
    email: 'kavifernando89@gmail.com',
    address: '34/H, Kadana Road, Malabe',
    phone: '0774563245',
    categories: ['Blood donation', 'Beach cleaning', 'Disaster relief'],
    profileImage: 'https://your-image-url' // Add actual image URL
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Image and Name */}
      <View style={styles.profileContainer}>
        <Image style={styles.profileImage} source={{ uri: user.profileImage }} />
        <Text style={styles.profileName}>{user.name}</Text>
        {/* <MaterialIcons name="edit" size={24} color="black" style={styles.editIcon} /> */}
      </View>

      {/* Personal Info */}
      <View style={styles.infoCard}>
      <Image source={User} style={styles.icon} />
        <Text style={styles.infoText}>{user.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={Email} style={styles.icon} />
        <Text style={styles.infoText}>{user.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={Address} style={styles.icon} />
        <Text style={styles.infoText}>{user.address}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image source={Call} style={styles.icon} />
        <Text style={styles.infoText}>{user.phone}</Text>
      </View>

      {/* Volunteer Categories */}
      <Text style={styles.sectionTitle}>Preferred Volunteer Categories</Text>
      <View style={styles.categoriesContainer}>
        {user.categories.map((category, index) => (
          <Text key={index} style={styles.categoryItem}>
            {category}
          </Text>
        ))}
      </View>
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
  editIcon: {
    position: 'absolute',
    top: 80,
    right: 10,
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
    width:40,
    height:40
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
  },
  categoryItem: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
});

export default ProfileScreen;
