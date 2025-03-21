import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import supabase from "./supabaseClient";
import {subscribeToLeagueInserts} from "./supabaseListeners";
import DropDownPicker from "react-native-dropdown-picker";



const LeagueSetupScreen = ({ route, navigation, onLeagueChosen }) => {
  const { mode,leagueName, leagueId, userId, leaguesTemp, leagues } = route.params; // Mode: "create" or "join"
  const [teamName, setTeamName] = useState("");
  const [leagueType, setLeagueType] = useState("Standard H2H"); // Default league type
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedLeagueType, setSelectedLeagueType] = useState("Standard H2H");


useEffect(() => {
    const unsubscribe = subscribeToLeagueInserts(setAvailableLeagues);
    supabase.getChannels().forEach(channel => console.log("Active channel:", channel));
    return () => unsubscribe(); // Cleanup
  }, []);


  // Fetch available leagues if joining
  useEffect(() => {
    if (mode === "join") {
        console.log(mode);
        console.log("Available Leagues before fetching: ", availableLeagues);
      fetchLeagues().then((leagueList) => {
        console.log("Another listing ", leaguesTemp);
        setAvailableLeagues(leagueList);
        console.log("Available Leagues are fetched", availableLeagues);
      });
    }
  }, [mode]);

  const fetchLeagues = async (leagueList) => {
    const { data, error } = await supabase.from("leagues").select("*");
    if (error) {
      console.error("Error fetching leagues:", error);
      return [];
    }
    leagueList = data;
    console.log("Available Leagues are: ", leagueList);
    console.log("User Leagues ", leagues);
    try{
      const registeredLeagueIds = leagues.map((league) => league.id);
      console.log("registeredLeagueIds ", registeredLeagueIds);
      const temp = registeredLeagueIds.some((p) => p === "03cf651b-693f-4171-b74e-8300bf28fc10");
      console.log(temp);
      const joinableLeagues = leagueList.filter((league) => !registeredLeagueIds.some((p) => p === league.league_id)
      );
      console.log("Joinable Leagues", joinableLeagues );
      leagueList = [...joinableLeagues];
      console.log("Updated League List ", leagueList);
    } catch (err) {
      console.error("🔥 Unexpected fetch error:", err);
    }
    return leagueList || [];
  };


  const initializeLeaguePlayers = async (leagueId) => {
    try {
      // Fetch all player IDs from players_base
      const { data: players, error: fetchError } = await supabase
        .from("players_base")
        .select("id");
  
      if (fetchError) {
        console.error("❌ Error fetching players:", fetchError.message);
        return;
      }
  
      if (!players || players.length === 0) {
        console.warn("⚠️ No players found in players_base.");
        return;
      }
  
      // Prepare batch insert data
      const leaguePlayersData = players.map((player) => ({
        league_id: leagueId,
        player_id: player.id,
        onroster: false, // Default value
      }));
  
      // Insert into league_players
      const { error: insertError } = await supabase
        .from("league_players")
        .insert(leaguePlayersData);
  
      if (insertError) {
        console.error("❌ Error inserting into league_players:", insertError.message);
      } else {
        console.log("✅ League players initialized successfully.");
      }
    } catch (err) {
      console.error("🔥 Unexpected error initializing league_players:", err);
    }
  };

  const initializeLeagueDraftState = async(leagueId) => {
    try {
      const { data: newData, error: insertError } = await supabase
      .from("draft_state")
      .insert([{ current_round: 1, current_pick: 0, draft_order: [] }])
      .select()
      .single();

      if (insertError) {
          console.error("Error initializing draft state:", insertError);
          return;
      }
    } catch (err) {
      console.error("🔥 Unexpected error initializing draft_state:", err);
    }
  };


  const handleConfirmSetup = async () => {
    console.log("Selected League", selectedLeague);
    if (!teamName.trim()) {
      Alert.alert("Error", "Please enter a team name.");
      return;
    }

    const finalLeagueId = mode === "create" ? leagueId : selectedLeague?.league_id;
    if (!finalLeagueId) {
      Alert.alert("Error", "No league selected.");
      return;
    }

    // Store league settings for the user
    const { error } = await supabase.from("league_rosters").insert([
      {
        league_id: finalLeagueId,
        user_id: userId,
        team_name: teamName,
        roster: [], // Initialize empty roster
        status: "active", // Default status for active players
      },
    ]);

    if (error) {
      Alert.alert("Error", "Failed to save league setup.");
      console.error("Supabase error:", error);
      return;
    }

    if (mode === "create"){
        await initializeLeaguePlayers(leagueId);
      //  await (initializeLeagueDraftState(leagueId);
    }else{
        console.error("Players table for this league is already setup");
    }

    onLeagueChosen(finalLeagueId);

    // Navigate to Main League View
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs"}],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === "create" ? "Create League" : "Join a League"}</Text>

      {mode === "create" ? (
        <>
          {/* Display League Name */}
          <Text style={styles.subtitle}>League: {leagueName}</Text>

          {/* League Type (Fixed for Now) */}
          <Text style={styles.label}>League Type</Text>
          
            <DropDownPicker
              open={open}
              value={selectedLeagueType} // ✅ Controls selected item
              items={[
                { label: "Standard H2H", value: "Standard H2H" } // ✅ Single option for now
              ]}
              setOpen={setOpen}
              setValue={setSelectedLeagueType}
              disabled={true} // ✅ Keeps it disabled since there's only one option
              style={styles.dropdownPicker}
          />


          {/* Team Name Input */}
          <Text style={styles.label}>Your Team Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Team Name"
            placeholderTextColor="#aaa"
            value={teamName}
            onChangeText={setTeamName}
          />

          <Button title="Confirm & Proceed" onPress={handleConfirmSetup} />
        </>
      ) : (
        <>
          {availableLeagues.length === 0 ? (
            <Text style={styles.noUsersText}>No Leagues found.</Text>
          ) : (
            <>
              <Text style={styles.label}>Select a League</Text>
              <FlatList
              data={availableLeagues}
              keyExtractor={(item) => (item?.league_id ? item.league_id.toString() : Math.random().toString())}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.leagueItem,
                    selectedLeague?.id === item.league_id && styles.selectedLeague,
                  ]}
                  onPress={() => setSelectedLeague(item)}
                >
                  <Text style={styles.leagueText}>{item.league_name}</Text>
                </TouchableOpacity>
              )}
              />
            </>
          )}

          {selectedLeague && (
            <>
              <Text style={styles.label}>Your Team Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Team Name"
                placeholderTextColor="#aaa"
                value={teamName}
                onChangeText={setTeamName}
              />

              <Button title="Join League" onPress={handleConfirmSetup} />
            </>
          )}
        </>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#bbb",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    alignSelf:"center",
  },
  pickerContainer: {
    backgroundColor: "#000",
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  dropdownPicker: {
    backgroundColor: "#555", // ✅ Matches dark theme
    borderColor: "#777",
    color: "white",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  picker: {
    color: "#fff",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    marginBottom: 20,
    color: "#fff",
    backgroundColor: "#333",
  },
  leagueItem: {
    padding: 15,
    backgroundColor: "#056813",
    marginTop : 20,
    marginBottom: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  selectedLeague: {
    backgroundColor: "#4CAF50",
  },
  leagueText: {
    color: "#fff",
    fontSize: 16,
  },
  noUsersText: {
    color: "#ccc",
    fontSize: 16,
  },
});

export default LeagueSetupScreen;
