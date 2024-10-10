import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user management
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration
import { AnimatedCircularProgress } from 'react-native-circular-progress'; // Import circular progress component

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

  // Skill mapping for each category (all lowercase to match normalized category)
  const categorySkillsMapping = {
    'beach clean': ['communication', 'teamwork'],
    'elderly care': ['adaptability', 'communication'],
    'food security & distribution': ['teamwork', 'organizationalSkills'],
    'fundraising events': ['communication', 'timeManagement'],
    'blood donation': ['teamwork', 'adaptability'],
    'disaster relief': ['teamwork', 'organizationalSkills', 'timeManagement'],
    'teaching & tutoring': ['communication', 'organizationalSkills'],
    'animal welfare & shelter support': ['adaptability', 'communication'],
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

      // Normalize category and calculate skill percentages based on event hours
      querySnapshot.forEach((doc) => {
        const data = doc.data().eventdData;
        
        if (!data || !data.category) {
          console.warn("Event data or category is missing", data);
          return; // Skip this iteration if data or category is missing
        }

        // Normalize the category name (convert to lowercase and trim spaces)
        const normalizedCategory = data.category.trim().toLowerCase();
        console.log('Normalized Category:', normalizedCategory); // Log normalized category for debugging

        // Map category to its respective skills
        const categories = categorySkillsMapping[normalizedCategory];
        
        if (categories) {
          const hours = data.hours || 0;
          categories.forEach((skill) => {
            updatedSkillData[skill] = Math.min(100, updatedSkillData[skill] + (hours * 3.5)); // Increment percentage based on hours
          });
        } else {
          console.warn("No skill mapping found for category:", normalizedCategory);
        }
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
        <AnimatedCircularProgress
            size={150} // Reduced size for the circle
            width={25} // Increased width for a thicker stroke
            fill={totalSkillPercentage} // Percentage to fill the circle
            tintColor='#6A9C89' // Green for filled part
            backgroundColor='#E9EFEC' // Light grey for empty part
            lineCap="round" // Makes the stroke end with rounded edges
            duration={1000} // Animation duration
          >
            {() => (
              <Text style={styles.circularText}>{Math.round(totalSkillPercentage)}%</Text>
            )}
          </AnimatedCircularProgress>
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
    fontSize: 24, // Decreased font size to fit inside the circle better
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    top: '40%', // Center the text vertically inside the circular progress bar
    left: '40%', // Center the text horizontally
    //transform: [{ translateX: -50 }, { translateY: -50 }], // Offset to align in the center
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
