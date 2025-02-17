import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import supabase from "./supabaseClient";



const MyTeamScreen = ({ roster, onDrop, userProfile, navigation}) => {
    

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedStatsType, setSelectedStatsType] = useState("week1");
    const [currentRoster, setRoster] = useState([...roster]); // Default to season stats


     // Example team data
    const teamName = userProfile?.team_name;
    const userName = userProfile?.user_name;
    //console.log(teamName);
    //console.log(userName);

    useEffect(() => {
      fetchPlayers();
    }, [roster, selectedPlayer, selectedStatsType]);


    const fetchPlayers = async () => {
      try{
        let seasonTeamData, matchData, error1, error2;
        let query;
        console.log("Start of MyTeam Filter for: ", selectedStatsType);
        ({ data: seasonTeamData, error: error1 } = await supabase.from("players_base").select("*"));   // Fetch Season Stats
        if (error1) throw new Error("❌ Error fetching season stats: " + error1.message);

        if (selectedStatsType === "season") {
          console.log("No need to do anything");
          setRoster(roster);
          return;
        } else if (selectedStatsType === "week1") {
          // Fetch Match Stats
          ({ data: matchData, error: error2 } = await supabase
            .from("players")
            .select("*"));
          //  .eq("week", 1)); 
          if (error2) 
            throw new Error("❌ Error fetching match stats: " + error2.message);
          else
            console.log("fetched weekly data: ", matchData);
            console.log("roster is ", roster);

          const mergedTeamPlayers = seasonTeamData.map((player) => {
            const matchStats = matchData.find((m) => m.id === player.id) || {};
            return {
              ...player,
              Opponent : matchStats.Opponent || "",
              goals: matchStats.goals || 0,
              assists: matchStats.assists || 0,
              Minutes: matchStats.Minutes || 0,
              PKMissed: matchStats.PKMissed || 0,
              "Goals Against": matchStats["Goals Against"] || 0,
              Saves: matchStats.Saves || 0,
              "Clean Sheet": matchStats["Clean Sheet"] || 0,
              "Yellow Cards": matchStats["Yellow Cards"] || 0,
              "Red Cards": matchStats["Red Cards"] || 0,
              FantasyPoints: matchStats.FantasyPoints || 0,
            }
          });

          // 🔄 **Merge Data: Default to 0s if player has no match data**
          const currentTeamPlayers = roster.map((player) => {
            const relevantPlayers = mergedTeamPlayers.find((m) => m.id === player.id) || {};
            return relevantPlayers
          })
          console.log("Players in players table and on this current user roster: ", currentTeamPlayers);

          const positionOrder = { GK: 1, DF: 2, MF: 3, FW: 4 };

          const sortedRoster = [...currentTeamPlayers].sort((a, b) => {
            console.log("Current roster is :", currentRoster);
            const posA = a.position.split("-")[0]; // Use first position for hybrid roles
            const posB = b.position.split("-")[0];
            return positionOrder[posA] - positionOrder[posB];
          });

          setRoster(sortedRoster);
          return;
        }
      } catch (err) {
        console.error("🔥 Unexpected fetch error:", err);
      }
    };


  return (
    <View style={styles.container}>
      {/* Team Name and Username */}
      <View style={styles.headerContainer}>
        <Text style={styles.teamName}>{teamName || "No Team Name"}</Text>
        <Text style={styles.username}>@{userName || "No Team Name"}</Text>
      </View>

      {/* Filters Row */}
      <View style={styles.filterRow}>
        <View style={styles.filterPickerContainer}>
          <Picker selectedValue={selectedStatsType} 
            onValueChange={(value) => {
            console.log("Changing MyTeam Stats Filter");
            setSelectedStatsType(value);}}
            style={styles.filterPicker}>
              <Picker.Item style={styles.filterText} label="Last Season(total)" value="season" />
              <Picker.Item style={styles.filterText} label="Week 1" value="week1" />
          </Picker>
        </View>
      </View>


      {/* Team Players Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Pos</Text>
          {/*<Text style={styles.headerCell}>Test</Text>*/}
          <Text style={styles.headerNameCell}>Name</Text>
          <Text style={styles.headerdataCell}>Fpts</Text>
        </View>



        <FlatList
          data={currentRoster}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedPlayer(item)}>
                <View style={styles.tableRow}>
                    <Text style={styles.cell}>{item.position}</Text>
                    <Image source={require("./assets/placeholder.png")} style={{ width: 40, height: 40, borderRadius: 25}} resizeMode="cover"/>                           
          
                    <View style={styles.playerNameContainer}>
                        <Text style={styles.playerName}>{item.name}</Text>
                        <View style={styles.tableSmallRow}>
                            <Text style={styles.teamNameSmall}>{item.team} </Text>
                            <Text style={styles.teamNameSmall}>Gls:{item.goals} </Text>
                            <Text style={styles.teamNameSmall}>Ast:{item.assists} </Text>
                            <Text style={styles.teamNameSmall}>vs:{item.Opponent} </Text>
                        </View>
                    </View>
                    <Text style={styles.datacell}>{item.FantasyPoints}</Text>
                </View>
            </TouchableOpacity>
          )}
        />

              {/* Drop Confirmation Modal */}
        <Modal visible={!!selectedPlayer} transparent animationType="slide">
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalText}>Drop {selectedPlayer?.name}?</Text>
                <View style={styles.modalbutton}>
                        <TouchableOpacity style={styles.buttonStyle} title="Drop" onPress={() => { onDrop(selectedPlayer); setSelectedPlayer(null); }}>
                          <Text style={styles.buttonText}>Drop</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonStyle} title="Cancel" onPress={() => setSelectedPlayer(null)}>
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                </View>
            </View>
            </View>
        </Modal>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  headerContainer: { marginBottom: 20 },
  teamName: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "left" },
  username: { color: "#bbb", fontSize: 16, textAlign: "left", marginTop: 4 },

  filterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, gap: 15 },
  filterPickerContainer: { flex: 1, backgroundColor: "#222", borderRadius: 12, paddingHorizontal: 2, height: 50, justifyContent: "center" },
  filterPicker: { color: "#fff", width: "100%" },
  filterText: { color: "#121212", fontWeight: "bold", fontSize: 14, textAlign: "center" },

  tableContainer: { marginTop: 10 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    justifyContent:"flex-start",
    paddingBottom: 8,
    gap: 25,
   // width : "%100"
  },
  headerCell: { flex: 0.5, color: "#fff", fontWeight: "bold", fontSize: 16 },
  headerNameCell: { flex: 1.1, color: "#fff", fontWeight: "bold", fontSize: 16 },
  headerdataCell: { flex: 0.25, color: "#fff", fontWeight: "bold", fontSize: 16},


  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 10,
    justifyContent:"flex-start",
    gap: 25,
  },
  cell: { flex: 0.6, color: "#fff", fontSize: 16},
  datacell: { flex: 1, color: "#fff", fontSize: 16},


  playerNameContainer: { flex: 5 },
  playerName: { color: "#fff", fontSize: 16},
  tableSmallRow: { flexDirection: "row", justifyContent:"flex-start", marginTop: 2},
  teamNameSmall: { color: "#bbb", fontSize: 14, marginTop: 2 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#1E1E1E", padding: 20, borderColor:"#4CAF50", borderRadius: 10, borderWidth: 1,  alignItems: "center" },
  modalText: { color:"#fff",fontSize: 18, fontWeight: "bold", marginBottom: 10, paddingBottom:10 },
  modalbutton: { backgroundColor: "1e1e1e", flexDirection: "row", justifyContent: "space-between", width: "40%" },
  buttonStyle: { backgroundColor: "#4CAF50", paddingVertical: 5, paddingHorizontal: 15, borderRadius: 4 },
  buttonText: {color: "#fff"},
});

export default MyTeamScreen;


