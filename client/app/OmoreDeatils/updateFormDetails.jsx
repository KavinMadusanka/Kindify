import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/FirebaseConfig'; // Assuming Firebase Storage is configured here
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UpdateFormDetails = () => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [volunteerHours, setVolunteerHours] = useState('');
  const [image, setImage] = useState(null); // Store image URI here
  const [imageUrl, setImageUrl] = useState(''); // Store image URL
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  // Fetch event details from Firestore to populate the form fields
  const fetchEventDetails = async () => {
    if (id) {
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const eventData = docSnap.data();
        setCategory(eventData.category || '');
        setDescription(eventData.description || '');
        setDate(eventData.date || '');
        setTime(eventData.time || '');
        setLocation(eventData.location || '');
        setVolunteerHours(eventData.volunteerHours?.toString() || '');
        setImageUrl(eventData.imageUrl || ''); // Fetch stored image URL
        setLoading(false);
      } else {
        console.log('No such document!');
      }
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  // Select image from the device
  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted) {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.cancelled) {
        setImage(pickerResult.uri);
      }
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (imageUri) => {
    if (!imageUri) return null;
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `events/${id}/image.jpg`);
    await uploadBytes(storageRef, blob);

    // Get the image URL from Firebase Storage
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Update event details in Firestore, including the image URL
  const handleUpdate = async () => {
    setLoading(true);
    let uploadedImageUrl = imageUrl; // Use the existing URL if no new image is uploaded

    if (image) {
      // Upload new image if one is selected
      uploadedImageUrl = await uploadImage(image);
    }

    if (id) {
      const docRef = doc(db, 'events', id);
      
      await updateDoc(docRef, {
        category,
        description,
        date,
        time,
        location,
        volunteerHours: parseInt(volunteerHours, 10), // Convert to number
        imageUrl: uploadedImageUrl, // Store the new image URL in Firestore
      });

      console.log('Event updated successfully!');
      navigation.goBack(); // Go back to the previous screen after update
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A9C89" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.textInput}
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textInput}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.textInput}
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Time</Text>
      <TextInput
        style={styles.textInput}
        value={time}
        onChangeText={setTime}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.textInput}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Volunteer Hours</Text>
      <TextInput
        style={styles.textInput}
        value={volunteerHours}
        onChangeText={(text) => {
          if (/^\d*$/.test(text)) {
            setVolunteerHours(text);
          }
        }}
        keyboardType="numeric"
      />

      {/* Display existing image if available */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : null}

      {/* Select new image */}
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Pick Image</Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UpdateFormDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E9EFEC',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#3A3A3A',
  },
  textInput: {
    height: 40,
    borderColor: '#6A9C89',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#6A9C89',
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 5,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#C4DAD2',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
