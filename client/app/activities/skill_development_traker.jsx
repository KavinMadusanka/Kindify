import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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

      const updatedSkillData = {
        communication: 0,
        teamwork: 0,
        adaptability: 0,
        organizationalSkills: 0,
        timeManagement: 0,
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data().eventdData;

        if (!data || !data.category) {
          console.warn("Event data or category is missing", data);
          return;
        }

        const normalizedCategory = data.category.trim().toLowerCase();
        const categories = categorySkillsMapping[normalizedCategory];

        if (categories) {
          const hours = parseFloat(data.hours) || 0; // Ensure hours is a number, defaulting to 0 if undefined
          categories.forEach((skill) => {
            updatedSkillData[skill] = Math.min(100, updatedSkillData[skill] + (hours * 3)); // Increment percentage
          });
        } else {
          console.warn("No skill mapping found for category:", normalizedCategory);
        }
      });

      setSkillData(updatedSkillData);

      // Calculate total percentage only for skills with non-zero values
      const totalCategories = Object.values(updatedSkillData).filter(value => value > 0).length;
      const totalPercentage = totalCategories
        ? Object.values(updatedSkillData).reduce((total, percentage) => total + percentage, 0) / totalCategories
        : 0;

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

  const toTitleCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
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

      {Object.entries(skillData).map(([skill, percentage]) => (
        <View key={skill} style={styles.progressContainer}>
          <Text style={styles.skillTitle}>{toTitleCase(skill)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      ))}

      <View style={styles.cornerRadiusBox}>
        <Text style={styles.overallLabel}>Overall Skill Development Level</Text>

        <AnimatedCircularProgress
          size={150}
          width={25}
          fill={Math.max(0, Math.min(100, totalSkillPercentage))} // Ensures fill is between 0 and 100
          tintColor='#6A9C89'
          backgroundColor='#E9EFEC'
          lineCap="round"
          duration={1000}
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
  cornerRadiusBox: {
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  circularText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    top: '40%',
    left: '33%',
  },
  overallLabel: {
    fontSize: 18,
    marginBottom: 20,
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
