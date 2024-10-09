import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user management
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PieChart } from 'react-native-chart-kit';
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration

const MonthlyActivityOverview = () => {
  const { user } = useUser(); // Fetch current user's info from Clerk
  const [activityData, setActivityData] = useState([]);
  const [totalAttended, setTotalAttended] = useState(0);
  const [loading, setLoading] = useState(true); // To show a loading state

  // Function to fetch and process activities
  const fetchActivities = async () => {
    try {
      const currentMonth = new Date().getMonth(); // Get the current month (0-indexed)
      const currentYear = new Date().getFullYear(); // Get the current year
      const currentUserEmail = user?.primaryEmailAddress?.emailAddress; // Get email from Clerk user object

      if (!currentUserEmail) {
        console.log('User email not available');
        setLoading(false);
        return;
      }

      // Firestore query to get user's joined events for the current month and year
      const q = query(
        collection(db, 'JoinEvent'),
        where('eventdData.emailAddress', '==', currentUserEmail), // Filter by user's email
        where('eventdData.status', '==', 'accept') // Only fetch accepted events
      );

      const querySnapshot = await getDocs(q);
      const monthlyData = {};

      // Process the data from Firestore
      querySnapshot.forEach((doc) => {
        const data = doc.data().eventdData; // Access the eventdData map
        const eventDate = new Date(data.date); // Convert the string date to a Date object

        // Ensure the event is within the current month and year
        if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
          const category = data.category.toLowerCase(); // Use category as the key
          monthlyData[category] = (monthlyData[category] || 0) + data.hours; // Sum hours for each category
        }
      });

      // Format data for PieChart
      const formattedData = Object.keys(monthlyData).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize category names
        hours: monthlyData[key],
        color: getRandomColor(),
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      }));

      setActivityData(formattedData);
      setTotalAttended(Object.values(monthlyData).reduce((a, b) => a + b, 0)); // Calculate total hours
      setLoading(false); // Stop loading spinner
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false); // Stop loading spinner in case of error
    }
  };

  // Utility to generate random colors for chart slices
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    fetchActivities(); // Fetch data when component loads
  }, [user]); // Refetch if user changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004F2D" />
        <Text>Loading your monthly activities...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Monthly Activity Overview</Text>

      {/* Pie Chart Section */}
      <View style={styles.chartContainer}>
        {activityData.length > 0 ? (
          <PieChart
            data={activityData}
            width={300}
            height={200}
            chartConfig={{
              backgroundColor: '#E6F2F0',
              backgroundGradientFrom: '#E6F2F0',
              backgroundGradientTo: '#E6F2F0',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            accessor="hours"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute // Show absolute values on the pie chart
          />
        ) : (
          <Text>No activity data available for this month.</Text>
        )}
      </View>

      {/* Activity Summary Table */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Activity Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Activity</Text>
            <Text style={styles.tableHeader}>Hours Attended</Text>
            <Text style={styles.tableHeader}>Percentage</Text>
          </View>
          {activityData.map((activity) => (
            <View style={styles.tableRow} key={activity.name}>
              <Text style={styles.tableCell}>{activity.name}</Text>
              <Text style={styles.tableCell}>{activity.hours}</Text>
              <Text style={styles.tableCell}>
                {((activity.hours / totalAttended) * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
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
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tableContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MonthlyActivityOverview;