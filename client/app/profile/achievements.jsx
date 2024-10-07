import React, { useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';  // For the "X" icon

const AchievementsScreen = () => {
  const navigation = useNavigation();

  // Hardcoded values for badges
  const [badges, setBadges] = useState([
    { 
      id: 1, 
      name: "Star Badge", 
      description: "Congratulations on completing your first volunteer activity.", 
      details: [
        "Total Volunteer Hours: 2", 
        "Next Milestone: 10 hours for the Neighborhood Hero badge", 
        "You've contributed to 1 projects, helping 10+ people."
      ],
      image: require("../../assets/images/star badge.png"),  // Sample image for each badge
    },
    { 
      id: 2, 
      name: "Hero Badge", 
      description: "Congratulations on reaching an important milestone! The Star badge is awarded to volunteers who have logged 10 hours of community service. Your dedication to making a difference in your community is truly commendable!", 
      details: [
        "Total Volunteer Hours: 10",
        "Next Milestone: 50 hours for Superhero badge",
        "You've impacted 20+ people in your community."
      ],
      image: require("../../assets/images/hero badge.png"),
    },
  ]);

  // State for modal visibility and content
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);  // Store the selected badge

  // When a badge is clicked, show the modal with the selected badge's content
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  return (
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
        {/* Example stat items */}
        <View style={styles.statItem}>
          <Text style={styles.statTitle}> Total   Hours</Text>
          <Image source={require("../../assets/images/Time Machine.png")} style={styles.statImage} />
          <Text style={styles.statNumber}>10</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statTitle}>  Projects Completed</Text>
          <Image source={require("../../assets/images/Numbers.png")} style={styles.statImage} />
          <Text style={styles.statNumber}>6</Text>
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
    marginBottom: 20,
  },
  badgesCountTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  badgesContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },
  badge: {
    alignItems: "center",
    marginHorizontal: 15,
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
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 140,
    elevation: 5,
    height: 300,
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
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#004F2D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 30,
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
