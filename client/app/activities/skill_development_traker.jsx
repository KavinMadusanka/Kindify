import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user management
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration
import { CircularProgress } from 'react-native-circular-progress'; // Import circular progress component

const SkillDevelopmentTracker = () => {
  const { user } = useUser();
  const [skillData, setSkillData] = useState({
    communication: 0,
    teamwork: 0,
    adaptability: 0,
    organizationalSkills: 0,
    timeManagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [totalSkillPercentage, setTotalSkillPercentage] = useState(0);

  // Skill mapping for each category
  const categorySkillsMapping = {
    'Beach Clean': ['communication', 'teamwork'],
    'Elderly Care': ['adaptability', 'communication'],
    'Food Security & Distribution': ['teamwork', 'organizationalSkills'],
    'Fundraising Events': ['communication', 'timeManagement'],
    'Blood Donation': ['teamwork', 'adaptability'],
    'Disaster Relief': ['teamwork', 'organizationalSkills', 'timeManagement'],
    'Teaching & Tutoring': ['communication', 'organizationalSkills'],
    'Animal Welfare & Shelter Support': ['adaptability', 'communication'],
  };

  // Function to fetch and process skill development data
  const fetchSkillDevelopmentData = async () => {
    try {
      const currentUserEmail = user?.primaryEmailAddress?.emailAddress;

      if (!currentUserEmail) {
        console.log('User email not available');
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'JoinEvent'),
        where('eventdData.emailAddress', '==', currentUserEmail),
        where('eventdData.status', '==', 'accept')
      );

      const querySnapshot = await getDocs(q);

      // Reset skill data for calculation
      const updatedSkillData = {
        communication: 0,
        teamwork: 0,
        adaptability: 0,
        organizationalSkills: 0,
        timeManagement: 0,
      };

      // Calculate skill percentages based on event hours
      querySnapshot.forEach((doc) => {
        const data = doc.data().eventdData;
        const hours = data.hours;

        const categories = categorySkillsMapping[data.category];
        categories.forEach((skill) => {
          updatedSkillData[skill] = Math.min(100, updatedSkillData[skill] + (hours * 7)); // Increment percentage based on hours
        });
      });

      setSkillData(updatedSkillData);

      // Calculate total skill percentage
      const totalPercentage = Object.values(updatedSkillData).reduce((total, percentage) => total + percentage, 0) / Object.keys(updatedSkillData).length;
      setTotalSkillPercentage(totalPercentage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching skill development data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillDevelopmentData();
  }, [user]);

  // Helper function to convert camelCase or other strings into Title Case
  const toTitleCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
      .trim(); // Remove extra spaces
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004F2D" />
        <Text>Loading skill development data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Skill Development Tracker</Text>

      {/* Horizontal Progress Bars for Each Skill */}
      {Object.entries(skillData).map(([skill, percentage]) => (
        <View key={skill} style={styles.progressContainer}>
          <Text style={styles.skillTitle}>{toTitleCase(skill)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      ))}

      {/* Circular Progress for Overall Skill Level */}
      <View style={styles.circularProgressContainer}>
        {/* Label for Overall Skill Development Level */}
        <Text style={styles.overallLabel}>Overall Skill Development Level</Text> 

        {/* Circular Progress Bar */}
        <CircularProgress
          value={totalSkillPercentage}
          radius={100}
          textColor="#333"
          activeStrokeColor="#4CAF50" // Green for filled part
          inActiveStrokeColor="#e0e0e0" // Light grey for empty part (background ring)
          inActiveStrokeOpacity={0.5} // Transparency for background ring
          inActiveStrokeWidth={20} // Thickness of empty ring
          activeStrokeWidth={20} // Thickness of filled ring
          duration={1000} // Animation duration
        />
        
        {/* Percentage Text inside the Circle */}
        <Text style={styles.circularText}>{Math.round(totalSkillPercentage)}%</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E5E4',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40, // Additional space for better alignment
  },
  circularText: {
    position: 'absolute',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    top: 95, // Adjust positioning for the percentage text
  },
  overallLabel: {
    fontSize: 18,
    marginBottom: 20, // Space between label and circular progress bar
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#E9EFEC',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6A9C89',
    borderRadius: 10,
  },
  percentageText: {
    textAlign: 'right',
    marginTop: 5,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SkillDevelopmentTracker;
