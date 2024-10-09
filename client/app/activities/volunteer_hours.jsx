import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo'; // Clerk for user management
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native'; // Import Victory components
import { db } from '../../config/FirebaseConfig'; // Your Firebase configuration

const VolunteerHours = () => {
  const { user } = useUser(); // Fetch current user's info from Clerk
  const [activityData, setActivityData] = useState([]); // Changed to array to hold category and hours
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true); // To show a loading state

  // Colors for each category
  const colorPalette = [
    '#c0392b', '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71',
    '#27ae60', '#3498db', '#2980b9', '#af7ac5', '#7d3c98'
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
          monthlyData[category] = (monthlyData[category] || 0) + data.hours; // Sum the hours for each category
        }
      });

      // Prepare data for VictoryBar
      const chartData = Object.keys(monthlyData).map((category, index) => ({
        category,
        hours: monthlyData[category],
        color: colorPalette[index % colorPalette.length], // Assign color based on index
      }));

      setActivityData(chartData);
      setTotalHours(chartData.reduce((total, item) => total + item.hours, 0)); // Calculate total hours
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
        <Text>Loading your volunteer hours...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Volunteer Hours</Text>

      {/* Bar Chart Section */}
      <View style={styles.chartContainer}>
        <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 20 }}>
          <VictoryBar
            data={activityData}
            x="category"
            y="hours"
            style={{
              data: {
                fill: ({ datum }) => datum.color, // Use assigned color
                width: 20,
              },
            }}
            // Remove x-axis labels
            labels={() => null}
          />
        </VictoryChart>
      </View>

      {/* Activity Summary Table */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Activity Summary</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={styles.tableHeader}>Color</Text>
            <Text style={styles.tableHeader}>Activity</Text>
            <Text style={styles.tableHeader}>Hours</Text>
          </View>
          {activityData.map((activity, index) => (
            <View style={styles.tableRow} key={activity.category}>
              <View
                style={[styles.colorBox, { backgroundColor: activity.color }]} // Use the corresponding color
              />
              <Text style={styles.tableCell}>{activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}</Text>
              <Text style={styles.tableCell}>{activity.hours}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Total Hours</Text>
            <Text style={styles.tableCell}>{totalHours}</Text>
          </View>
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
    marginBottom: 10, // Reduced margin
    textAlign: 'center',
    color: '#333',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#333',
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
  tableHeaderRow: {
    fontWeight: 'bold',
  },
  tableHeader: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold', // Added bold for header
  },
  tableCell: {
    flex: 1,
    textAlign: 'center', // Center alignment for cells
    color: '#555',
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VolunteerHours;
