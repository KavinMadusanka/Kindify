import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// Icon import (assuming you have SVG or Image assets or using a library like react-native-vector-icons)
const MonthlyActivityIcon = require('../../assets/images/monthly-activity.png'); // Placeholder path, update with actual icon paths
const VolunteerHoursIcon = require('../../assets/images/volunteer-hours.png');
const SkillTrackerIcon = require('../../assets/images/skill-development.png');
const PreviousMonthIcon = require('../../assets/images/previous-month.png');

export default function Activities() {
  return (
    <View style={styles.container}>
      {/* Title */}
      {/* <Text style={styles.title}>Activities</Text> */}

      {/* Grid of activity cards */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <Image source={MonthlyActivityIcon} style={styles.icon} />
          <Text style={styles.cardText}>Monthly Activity Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Image source={VolunteerHoursIcon} style={styles.icon} />
          <Text style={styles.cardText}>Volunteer Hours</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Image source={SkillTrackerIcon} style={styles.icon} />
          <Text style={styles.cardText}>Skill Development Tracker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Image source={PreviousMonthIcon} style={styles.icon} />
          <Text style={styles.cardText}>Previous Month Insights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2F0',
    justifyContent: 'center', // Center the grid vertically
    alignItems: 'center',     // Center the grid horizontally
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontFamily:'outfit',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#234D33',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%', // Ensure the grid takes the full width of the container
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 60,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontFamily:'outfit',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#234D33',
    textAlign: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});
