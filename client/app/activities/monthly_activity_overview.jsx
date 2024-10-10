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

  // Colors for each category
  const colorPalette = [
    '#c0392b', '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#af7ac5', '#7d3c98'
  ];

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
          monthlyData[category] = (monthlyData[category] || 0) + 1; // Count the number of events per category
        }
      });

      // Format data for PieChart with predefined colors
      const formattedData = Object.keys(monthlyData).map((key, index) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize category names
        count: monthlyData[key],
        color: colorPalette[index % colorPalette.length], // Cycle through the color palette
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      }));

      setActivityData(formattedData);
      setTotalAttended(Object.values(monthlyData).reduce((a, b) => a + b, 0)); // Calculate total events attended
      setLoading(false); // Stop loading spinner
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false); // Stop loading spinner in case of error
    }
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

      {/* Centered Pie Chart Section */}
      <View style={styles.chartContainer}>
        {activityData.length > 0 ? (
          <PieChart
            data={activityData.map((activity) => ({
              name: activity.name,
              count: activity.count,
              color: activity.color,
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            }))}
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
            accessor="count"
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
            <Text style={styles.tableHeader}>Color</Text>
            <Text style={styles.tableHeader}>Activity</Text>
            <Text style={styles.tableHeader}>Times Attended</Text>
            <Text style={styles.tableHeader}>Percentage</Text>
          </View>
          {activityData.map((activity) => (
            <View style={styles.tableRow} key={activity.name}>
              {/* Add a colored box for the color guide */}
              <View
                style={[
                  styles.colorBox,
                  { backgroundColor: activity.color },
                ]}
              />
              <Text style={styles.tableCell}>{activity.name}</Text>
              <Text style={styles.tableCell}>{activity.count}</Text>
              <Text style={styles.tableCell}>
                {((activity.count / totalAttended) * 100).toFixed(0)}%
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
    alignItems: 'center', // Center the pie chart
    justifyContent: 'center', // Center the pie chart
    marginBottom: 20,
  },
  tableContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MonthlyActivityOverview;
 