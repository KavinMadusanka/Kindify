import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker'; // Import Expo Image Picker

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

    return (
        <ScrollView style={styles.container}>
            {/* Your existing UI components... */}
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
                />
            </View>

            {/* Purpose */}
            <View style={styles.inputContainer}>
                <Image source={PurposeIcon} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    placeholder="Volunteer Hours"
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
            <TouchableOpacity style={styles.publishButton}>
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
    padding: 20,
},
inputContainer: {
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center vertically
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
},
icon: {
    width: 24,
    height: 24,
    marginRight: 10,
},
textInput: {
    flex: 1,
    padding: 10,
    marginLeft: 10, // Added margin for spacing from the icon
},
textInputDropdown: {
    height: 50,
    padding: 10,
    marginLeft: 10, // Added margin for spacing from the icon
},
imageUploadTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold', // Added bold font for emphasis
},
imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10, // Added margin to separate from button
},
imageContainer: {
    position: 'relative',
    marginRight: 10,
},
imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
},
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'red',
        borderRadius: 10,
        padding: 5,
    },
    removeButtonText: {
        color: '#FFFFFF', // Color for the remove button text
    },
    uploadImageContainer: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
      flexDirection: 'column', // Align title and button vertically
      justifyContent: 'space-between', // Space between the title and button
      height: 150, // Set height for the box
  },
  
  imageRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
      // Removed margin bottom to have space between the images and the button
  },
  
  imageButton: {
      backgroundColor: '#008CBA',
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
      position: 'absolute', // Positioning the button at the bottom
      bottom: 10, // Space from the bottom
      left: 10, // Align to the left
      right: 10, // Align to the right
  },
  
    publishButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    publishButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
