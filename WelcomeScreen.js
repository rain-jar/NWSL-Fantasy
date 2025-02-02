import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const WelcomeScreen = ({ navigation }) => {
    
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to NWSL Fantasy!</Text>
      <Text style={styles.subtitle}>Select an option to continue:</Text>

      <Button title="Create Profile" onPress={() => navigation.navigate("ProfileScreen")} />
      <View style={styles.buttonSpacing} />
      <Button title="Existing User" onPress={() => {
        //console.log("Going back to Login");
        navigation.navigate("ProfileList");
    }} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
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
  },
  buttonSpacing: {
    marginVertical: 10, // Adds space between buttons
  },
});

export default WelcomeScreen;
