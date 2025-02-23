import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, StyleSheet } from "react-native";
import supabase from "./supabaseClient";

const CreateJoinScreen = ({ navigation, currentUser, onLeagueChosen }) => {
  const [leagues, setLeagues] = useState([]); // User's leagues
  const [leagueName, setLeagueName] = useState(""); // New league creation
  const [creatingLeague, setCreatingLeague] = useState(false); // Toggle for input UI


  // 🔄 Fetch user's leagues
  useEffect(() => {
    const fetchUserLeagues = async () => {
      console.log("Fetching User Leagues in CreateJoin for ", currentUser.id);

      if (!currentUser.id) {
        console.error("❌ currentUserId is undefined, skipping query.");
        return;
      }

      const { data, error } = await supabase
        .from("league_rosters")
        .select("league_id, leagues(league_name)")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching user leagues:", error);
      } else {
        setLeagues(data.map((entry) => ({ id: entry.league_id, name: entry.leagues.league_name })));
        console.log("Fetched User Leagues in CreateJoin for ", data);

      }
    };
    fetchUserLeagues();
  }, [currentUser]);

  // ➕ **Create a League**
  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      alert("Enter a league name.");
      return;
    }

    // Insert into leagues table
    const { data, error } = await supabase
      .from("leagues")
      .insert([{ league_name: leagueName, commissioner_id: currentUser.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating league:", error);
      alert("Failed to create league.");
      return;
    }

    const leagueId = data.league_id;
    const userId = currentUser.id;

    navigation.navigate("LeagueSetupScreen", { mode: "create",leagueName, leagueId, userId, leagues });
  };

  const handleJoinLeague = async() => {
    const userId = currentUser.id;
    console.log("userId", userId);
    const { data, error } = await supabase.from("leagues").select("*");
    if (error) {
        console.error("Error fetching leagues:", error);
        return;
    }
    console.log("leagueList is : ", data);
    const leaguesTemp = data;
    console.log("Fetched before navigating to SetupScreen ", leaguesTemp);
    navigation.navigate("LeagueSetupScreen", { mode: "join", userId, leagues });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}> 🏆 Your Current Leagues</Text>
      {leagues.length === 0 ? (
        <Text style={styles.emptyText}>You haven't joined any leagues yet.</Text>
      ) : (
        <FlatList
          data={leagues}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.leagueCard}
              onPress={() => {
                onLeagueChosen(item.id);
                navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
              }}
            >
              <Text style={styles.leagueName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ➕ "Create a League" Button */}
      {creatingLeague ? (
        <View style={styles.createLeagueContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter League Name"
            placeholderTextColor="#aaa"
            value={leagueName}
            onChangeText={setLeagueName}
          />
          <Button title="Create" onPress={handleCreateLeague} />
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => setCreatingLeague(true)}>
          <Text style={styles.buttonText}>Create a League</Text>
        </TouchableOpacity>
      )}

      {/* 📋 "Join a League" Button (Future Logic)*/}
        <TouchableOpacity style={styles.button} onPress={() => {console.log("Join Button Clicked"); handleJoinLeague();}}>
          <Text style={styles.buttonText}>Join A League</Text>
        </TouchableOpacity>

       {/* <Button style={styles.buttonNew} title="Join League" onPress={handleJoinLeague} />*/}
        


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E1E1E", padding: 50 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 100 },
  subtitle: { fontSize: 20, fontWeight: "bold", color: "#bbb", marginBottom: 100 },
  emptyText: { fontSize: 16, color: "#777", marginBottom: 20 },
  leagueCard: { backgroundColor: "#333", padding: 15, borderRadius: 8, marginVertical: 15, width: "100%", alignItems: "center" },
  leagueName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  createLeagueContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: { width: "60%", padding: 10, borderWidth: 1, borderColor: "#666", borderRadius: 8, marginBottom: 10, color: "#fff", backgroundColor: "#333" },
  button: { backgroundColor: "#4CAF50", padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 10, width: "80%" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonNew :{ backgroundColor: "#4CAF50", padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 10, width: "80%" },
});

export default CreateJoinScreen;
