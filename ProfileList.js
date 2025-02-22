import React, { useState } from "react";
import { useEffect } from "react";
import { LeagueProvider, useLeague } from "./LeagueContext";


import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const ProfileList = ({ onSelect, navigation }) => {

  const { users, setUsers } = useLeague();

  const [profiles, setProfiles] = useState([...users]);

  console.log("Checking current users in ProfileList ", users);

  useEffect(() => {
    setProfiles(users);
  }, [users]);
  

  const handleSelectUser = async(userId) => {
    await onSelect(userId);
    navigation.reset({
      index: 0,
      routes: [{ name: "CreateJoinScreen" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Profile</Text>

      {profiles.length === 0 ? (
        <Text style={styles.noUsersText}>No users found. Create a new profile.</Text>
      ) : (
        <FlatList
          key = {profiles.length}
          data={profiles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userItem} onPress={() => handleSelectUser(item.id)}>
              <Text style={styles.userName}>{item.user_name} ({item.team_name})</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  noUsersText: {
    color: "#ccc",
    fontSize: 16,
  },
  userItem: {
    backgroundColor: "#333",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  userName: {
    color: "#fff",
    fontSize: 18,
  },
});

export default ProfileList;
