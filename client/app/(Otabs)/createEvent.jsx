import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker'; // Import Expo Image Picker
import { db } from '../../config/FirebaseConfig'; // Import your Firebase configuration
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions

// Your icons
const LogoIcon = require('../../assets/images/Logo.png');
const DescriptionIcon = require('../../assets/images/Logo.png');
const DateIcon = require('../../assets/images/Logo.png');
const TimeIcon = require('../../assets/images/Logo.png');
const LocationIcon = require('../../assets/images/Logo.png');
const PurposeIcon = require('../../assets/images/Logo.png');

export default function CreateEventScreen() {
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [location, setLocation] = useState('');
    const [volunteerHours, setVolunteerHours] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [images, setImages] = useState([]); // State to store selected images

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    };

    const onTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(false);
        setTime(currentTime);
    };

    // Function to pick images
    const pickImage = async () => {
        // Request permission to access the media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }

        if (images.length >= 4) {
            Alert.alert("Limit Reached", "You can only upload up to 4 images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const pickedImage = result.assets[0].uri; // Get the image URI
            setImages([...images, pickedImage]); // Add the new image to the array
        } else {
            console.log('User cancelled image picker');
        }
    };

    // Function to remove an image
    const removeImage = (index) => {
        const updatedImages = images.filter((_, imgIndex) => imgIndex !== index);
        setImages(updatedImages);
    };

    // Function to publish event details to Firestore
    const publishEvent = async () => {
        try {
            // Validate inputs
            if (!category || !description || !location || !volunteerHours) {
                Alert.alert('Please fill all fields.');
                return;
            }

            // Prepare data to be saved
            const eventData = {
                category,
                description,
                date: date.toDateString(),
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location,
                volunteerHours,
                images,
            };

            // Add event to Firestore
            const docRef = await addDoc(collection(db, 'events'), eventData);
            Alert.alert('Event published!', `Event ID: ${docRef.id}`);
        } catch (error) {
            console.error('Error adding document: ', error);
            Alert.alert('Error publishing event. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Category Dropdown */}
            <View style={styles.inputContainer}>
                <Image source={LogoIcon} style={styles.icon} />
                <RNPickerSelect
                    onValueChange={(value) => setCategory(value)}
                    items={[
                        { label: 'Beach Cleanup', value: 'beach_cleanup' },
                        { label: 'Blood Donation', value: 'blood_donation' },
                        { label: 'Elderly Care', value: 'elderly_care' },
                    ]}
                    style={{
                        inputIOS: styles.textInputDropdown,
                        inputAndroid: styles.textInputDropdown,
                    }}
                    placeholder={{ label: 'Select Category', value: null }}
                    useNativeAndroidPickerStyle={false}
                />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
                <Image source={DescriptionIcon} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            {/* Date Picker */}
            <View style={styles.inputContainer}>
                <Image source={DateIcon} style={styles.icon} />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.textInput}>
                        {date.toDateString()}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>

            {/* Time Picker */}
            <View style={styles.inputContainer}>
                <Image source={TimeIcon} style={styles.icon} />
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.textInput}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
                {showTimePicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
                <Image source={LocationIcon} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    placeholder="Location"
                    value={location}
                    onChangeText={setLocation}
                />
            </View>

            {/* Purpose */}
            <View style={styles.inputContainer}>
                <Image source={PurposeIcon} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    placeholder="Volunteer Hours"
                    value={volunteerHours}
                    onChangeText={setVolunteerHours}
                />
            </View>

            {/* Image Upload */}
            <View style={styles.uploadImageContainer}>
                <Text style={styles.imageUploadTitle}>Upload Images (Max 4)</Text>
                <View style={styles.imageRow}>
                    {images.map((image, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeImage(index)}
                            >
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.imageButtonText}>Add Image</Text>
                </TouchableOpacity>
            </View>

            {/* Publish Button */}
            <TouchableOpacity style={styles.publishButton} onPress={publishEvent}>
                <Text style={styles.publishButtonText}>Publish</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// Your styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2F0',
    paddingHorizontal: 20, // Added more horizontal padding for better spacing
    paddingTop: 75,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  textInputDropdown: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  uploadImageContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    position: 'relative',
    margin: 5,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  imageButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  publishButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});
