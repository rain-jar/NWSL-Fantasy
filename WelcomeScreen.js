import React from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from "react-native";

const WelcomeScreen = ({ navigation }) => {
    
  return (


      <View style={styles.container}>
        <Image
          source={require("./assets/NWSLLandingImage.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
          <Text style={styles.title}>Welcome to NWSL Fantasy!</Text>
          <Text style={styles.subtitle}>Select an option to continue:</Text>
          <TouchableOpacity style={styles.oblongButton} onPress={() => navigation.navigate("ProfileScreen")}>
            <Text style={styles.oblongButtonText}>Create Profile</Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacing} />
          <TouchableOpacity style={styles.oblongButton} onPress={() => navigation.navigate("ProfileList")}>
            <Text style={styles.oblongButtonText}>Existing User</Text>
          </TouchableOpacity>
      </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
  },
  Content: {

  },
  backgroundImage: {
    position: "absolute",
    width: "110%",    // Fill the entire screen width
    height: "110%",  // Fill the entire screen height
    top: 0,
    left: "0%",
    // The Image will fill the container using the "cover" mode
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
    textAlign: "center"
  },
  buttonSpacing: {
    marginVertical: 10, // Adds space between buttons
  },
  button: { 
    backgroundColor: "#4CAF50", 
    borderRadius: 10,
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    marginVertical: 10, 
    width: "80%" },

  oblongButton: {
    // Padding
    paddingVertical: 12,
    paddingHorizontal: 24,

    // Oblong shape
    borderRadius: 40,

    // Distinct background & border
    backgroundColor: '#fff', // Green background
    borderColor: '#000',     // Yellow border
    borderWidth: 3,

    // Align text (when using <TouchableOpacity> or <Pressable>)
    alignItems: 'center',
    justifyContent: 'center',
  },
  oblongButtonText: {
    // Font styles
    fontSize: 16,
    color: '#000',
    // If you want text centered
    textAlign: 'center',
  },

});

export default WelcomeScreen;
