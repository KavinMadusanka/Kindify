import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal ,ScrollView} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';  // For the "X" icon
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Import your Firebase config

const AchievementsScreen = () => {
  const navigation = useNavigation();

  // State for modal visibility and content
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);  // Store the selected badge

  // State for total hours and projects
  const [totalHours, setTotalHours] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  // State for earned badges
  const [badges, setBadges] = useState([]);

  // Fetch completed projects and total hours
  const fetchAchievementsData = async () => {
    try {
      const q = query(collection(db, 'JoinEvent'), where('eventdData.status', '==', 'accept'));
      const querySnapshot = await getDocs(q);
      let hours = 0;
      let projects = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        hours += data.eventdData.hours; // Assuming 'hours' is a field in your JoinEvent collection
        projects += 1; // Count each accepted event as a project
      });

      setTotalHours(hours);
      setTotalProjects(projects);

      // Check conditions for badges
      awardBadges(hours, projects);

    } catch (error) {
      console.error('Error fetching achievements data:', error);
    }
  };

  // Function to award badges based on conditions
  const awardBadges = (hours, projects) => {
    const newBadges = [];
  
    if (hours >= 10) {
      newBadges.push({
        id: 1, // Unique ID for Star Badge
        name: "Star Badge",
        description: "Congratulations! You've logged 10 volunteer hours.",
        details: [
          "Total Volunteer Hours: 10",
          "Keep up the great work to reach new milestones!",
          "Next milestone: 50 hours for the Super Star badge.",
        ],
        image: require("../../assets/images/star badge.png"),
      });
    }
  
    if (hours >= 50) {
      newBadges.push({
        id: 2, // Unique ID for Super Star Badge
        name: "Super Star Badge",
        description: "Amazing! You've logged 50 volunteer hours.",
        details: [
          "Total Volunteer Hours: 50",
          "Your dedication is truly commendable!",
          "Next milestone: 80 hours for the Galaxy badge.",
        ],
        image: require("../../assets/images/super star badge.png"),
      });
    }
  
    if (hours >= 80) {
      newBadges.push({
        id: 3, // Unique ID for Galaxy Badge
        name: "Galaxy Badge",
        description: "Amazing! You've logged 80 volunteer hours.",
        details: [
          "Total Volunteer Hours: 80",
          "Your dedication is truly commendable!",
        ],
        image: require("../../assets/images/galaxy badge.png"),
      });
    }
  
    if (projects >= 10) {
      newBadges.push({
        id: 4, // Unique ID for Hero Badge
        name: "Hero Badge",
        description: "Congratulations! You've completed 10 volunteer events.",
        details: [
          "Total Projects: 10",
          "Keep up the great work to reach new milestones!",
          "Next milestone: Complete 30 volunteer events for the Super Hero badge.",
        ],
        image: require("../../assets/images/hero badge.png"),
      });
    }
  
    if (projects >= 30) {
      newBadges.push({
        id: 5, // Unique ID for Super Hero Badge
        name: "Super Hero Badge",
        description: "Outstanding! You've completed 30 projects.",
        details: [
          "Total Projects: 30",
          "You're making a huge impact in your community!",
          "Next milestone: Complete 50 volunteer events for the Community Helper badge.",
        ],
        image: require("../../assets/images/super hero badge.png"),
      });
    }
  
    if (projects >= 50) {
      newBadges.push({
        id: 6, // Unique ID for Community Helper Badge
        name: "Community Helper Badge",
        description: "Outstanding! You've completed 50 projects.",
        details: [
          "Total Projects: 50",
          "You're making a huge impact in your community!",
        ],
        image: require("../../assets/images/community helper.png"),
      });
    }
  
    setBadges(newBadges);
  };  

  useEffect(() => {
    fetchAchievementsData(); // Fetch data when the component mounts
  }, []);

  // When a badge is clicked, show the modal with the selected badge's content
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.subtitle}>Celebrate Your Impact</Text>

      {/* Total Badges Earned Section */}
      <View style={styles.card}>
        <Text style={styles.badgesCountTitle}>Total Badges Earned - {badges.length}</Text>
      </View>

      {/* Badges Section */}
      <View style={styles.badgesContainer}>
        {badges.map((badge) => (
          <TouchableOpacity key={badge.id} onPress={() => handleBadgeClick(badge)}>
            <View style={styles.badge}>
              <Image source={badge.image} style={styles.badgeImage} />
              <Text>{badge.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}> Total   Hours</Text>
          <Image source={require("../../assets/images/Time Machine.png")} style={styles.statImage} />
          <Text style={styles.statNumber}>{totalHours}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>    Events Completed</Text>
          <Image source={require("../../assets/images/Numbers.png")} style={styles.statImage} />
          <Text style={styles.statNumber}>{totalProjects}</Text>
        </View>
      </View>

      {/* Button to view new opportunities */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('home')}  // Navigate to the Home page
      >
        <Text style={styles.buttonText}>View New Opportunities</Text>
      </TouchableOpacity>

      {/* Modal for Badge Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {/* Close button (X icon) */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>

            {/* Badge Image */}
            {selectedBadge && (
              <>
                <Image source={selectedBadge.image} style={styles.modalBadgeImage} />

                {/* Badge Title */}
                <Text style={styles.modalTitle}>{selectedBadge.name}</Text>

                {/* Badge Description */}
                <Text style={styles.modalText}>{selectedBadge.description}</Text>

                {/* Badge Details */}
                <Text style={styles.modalDetails}>
                  {selectedBadge.details.map((detail, index) => (
                    <Text key={index}>
                      {"\u2022"} {detail}{"\n"}
                    </Text>
                  ))}
                </Text>

                {/* Close Button at the bottom */}
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#E7EFEF",
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 20,
    marginVertical: 10,
    fontWeight: "bold",
  },
  card: {
    width: 350,
    height: 64,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  badgesCountTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',           // Allow items to wrap to the next line
    justifyContent: 'space-around', // Add space between badges in a row
    marginVertical: 20,
  },
  badge: {
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom:10
  },
  badgeImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 35,
    marginTop:10
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 140,
    elevation: 5,
    height: 320,
  },
  statImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    marginTop: 30,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#004F2D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 30,
    marginBottom:50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',  // For a translucent background effect
  },
  modalView: {
    width: 320,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBadgeImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: "justify",
    marginBottom: 20,
  },
  modalDetails: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalCloseButton: {
    backgroundColor: "#004F2D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AchievementsScreen;