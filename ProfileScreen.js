import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import supabase from "./supabaseClient";



const ProfileScreen = ({ navigation, onSave }) => {
  const [teamName, setTeamName] = useState("");
  const [userName, setUserName] = useState("");

  const handleSaveProfile = async () => {
    if (!teamName || !userName) {
      alert("Please enter both Team Name and User Name.");
      return;
    }
    
    profile = [{ tN: teamName, uN: userName}];
    //console.log("Profile to App.tsx");


    onSave(teamName,userName);
    navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
    });



    // Reset navigation to MainTabs with updated profile
    //console.log("Profile to MainTabs");

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Team Name"
        placeholderTextColor="#aaa"
        value={teamName}
        onChangeText={setTeamName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        placeholderTextColor="#aaa"
        value={userName}
        onChangeText={setUserName}
      />

      <Button title="Save Profile" onPress={handleSaveProfile} />
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
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    marginBottom: 10,
    color: "#fff",
    backgroundColor: "#333",
  },
});

export default ProfileScreen;
