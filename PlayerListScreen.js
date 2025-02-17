import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
//import playerDataNew from "./assets/players.json";
import { ScrollView } from "react-native";
//import { ScrollView } from "react-native-gesture-handler";
import supabase from "./supabaseClient";




const PlayerListScreen = ({ playerData, onAdd, teamRoster, navigation }) => {

    const [players, setPlayers] = useState([...playerData]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [selectedStatsType, setSelectedStatsType] = useState("season"); // Default to season stats
    const [playerList, setPlayerList] = useState([]); // Store fetched data

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [modalMessage, setModalMessage] = useState("");

    const [scrollX, setScrollX] = useState(0); // Track scroll position
  
    useEffect(() => {
      fetchPlayers().then((updatedList) => {
        filterAndSortPlayers(updatedList); // Pass fetched list for filtering
      });
    }, [searchQuery, selectedPosition, selectedTeam, sortField, sortOrder, selectedStatsType]);
  
    const fetchPlayers = async (playerListTemp) => {
        try{
          let seasonData, matchData, error1, error2;
          let query;
          console.log("starting to fetch players for: ", selectedStatsType);
          ({ data: seasonData, error: error1 } = await supabase.from("players_base").select("*").eq("onroster", false));   // Fetch Season Stats
          if (error1) throw new Error("❌ Error fetching season stats: " + error1.message);

          if (selectedStatsType === "season") {
            setPlayerList(seasonData); 
            console.log("✅ Season Player List Updated:", seasonData);
            playerListTemp = seasonData
            return playerListTemp;
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

            // 🔄 **Merge Data: Default to 0s if player has no match data**
            const mergedPlayers = seasonData.map((player) => {
              const matchStats = matchData.find((m) => m.id === player.id) || {};
              return {
                ...player,
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
              };
            }); 
            setPlayerList(mergedPlayers);  
            console.log("New Player View merged for Weekly data", mergedPlayers);
            playerListTemp = mergedPlayers
            return playerListTemp;
          }
        } catch (err) {
          console.error("🔥 Unexpected fetch error:", err);
        }
    };
    
    const filterAndSortPlayers = async(updatedList) => {
      console.log("filter is called");
      let filtered = players;

      if (selectedStatsType)
        filtered = [...updatedList];
        console.log("playerList is updated in Filter due to Stats Filter", updatedList);
        console.log("filterList is updated in Filter due to Stats Filter", filtered);


      if (searchQuery) {
        filtered = filtered.filter((player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
  
      if (selectedPosition) {
        filtered = filtered.filter((player) => player.position.includes(selectedPosition));
      }
  
      if (selectedTeam) {
        filtered = filtered.filter((player) => player.team === selectedTeam);
      }

      filtered.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === "goals" || sortField === "assists" || sortField === "Minutes" || sortField === "FantasyPoints") {
          valA = Number(valA);
          valB = Number(valB);
        }
        if (sortOrder === "asc") return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  
      if (JSON.stringify(filtered) !== JSON.stringify(players)) {
        setPlayers(filtered);
        console.log("🔄 setPlayers updated inside Player Filter!");
      } else {
        console.log("⚡ No change in player data, avoiding re-render.");
      }
    };
  
    const toggleSort = (field) => {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    };

    // Adding a Player --> check for Team empty spots
    const checkAndAddPlayer = () => {


        const maxPlayersPerTeam = 11;
        const minPositions = { FW: 1, MF: 3, DF: 3, GK: 1 };
        const maxPositions = { FW: 4, MF: 5, DF: 5, GK: 1 };

        const positionCount = {
            FW: teamRoster.filter(p => p.position.includes("FW")).length,
            MF: teamRoster.filter(p => p.position.includes("MF")).length,
            DF: teamRoster.filter(p => p.position.includes("DF")).length,
            GK: teamRoster.filter(p => p.position.includes("GK")).length
            };
        
            // Position constraints
            if (selectedPlayer.position.includes("GK") && positionCount.GK >= maxPositions.GK) { setModalMessage("Already has a GK"); return;}
            if (teamRoster.length >= maxPlayersPerTeam) {setModalMessage("No Spot Left"); return;}
        
            if (teamRoster.length < maxPlayersPerTeam) {
            const playerPositions = selectedPlayer.position.split("-");
            const canFit = playerPositions.some(pos => positionCount[pos] < maxPositions[pos]);
            if (!canFit) {setModalMessage("Already has players of this position");return;}
            }
        
            // **Min Position Check**: If the team is reaching 11 players, ensure all min requirements are met
            if (teamRoster.length === maxPlayersPerTeam - 1) {
                for (const pos in minPositions) {
                    if (positionCount[pos] < minPositions[pos] && !selectedPlayer.position.includes(pos)) {
                    return false; // This pick would make the team invalid
                    }
                }
            }           

          onAdd(selectedPlayer); // Add player to My Team
          setModalMessage("");
          setSelectedPlayer(null); // Close modal
    }

    return(
        <View style={styles.container}>
        <Text style={styles.title}>Player List</Text>

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search players..."
          placeholderTextColor="#bbb"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
  
        {/* Filters Row */}
        <View style={styles.filterRow}>
          <View style={styles.filterPickerContainer}>
            <Picker selectedValue={selectedPosition} onValueChange={setSelectedPosition} style={styles.filterPicker}>
              <Picker.Item style={styles.filterText} label="Position" value="" />
              <Picker.Item style={styles.filterText} label="FW" value="FW" />
              <Picker.Item style={styles.filterText} label="MF" value="MF" />
              <Picker.Item style={styles.filterText} label="DF" value="DF" />
              <Picker.Item style={styles.filterText} label="GK" value="GK" />
            </Picker>
          </View>
  
          <View style={styles.filterPickerContainer}>
            <Picker selectedValue={selectedTeam} onValueChange={setSelectedTeam} style={styles.filterPicker}>
              <Picker.Item style={styles.filterText} label="Team" value="" />
              {[...new Set(players.map((p) => p.team))].map((team) => (
                <Picker.Item style={styles.filterText} key={team} label={team} value={team} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterPickerContainer}>
            <Picker
              selectedValue={selectedStatsType}
              onValueChange={(value) => {
                console.log("Changing Stats Filter");
                setSelectedStatsType(value);}}
              style={styles.filterPicker}
            >
              <Picker.Item style={styles.filterText} label="Last Season(total)" value="season" />
              <Picker.Item style={styles.filterText} label="Week 1" value="week1" />
            </Picker>
          </View>

        </View>

        {/* Table Header */}
        <View style={{ flex: 1, padding: 10 }}>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                    <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>        </Text>
                    <Text style={styles.headerText}>            </Text>
                    <TouchableOpacity onPress={() => toggleSort("name")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Name {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("team")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Team</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("position")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Pos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("FantasyPoints")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Fpts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("Minutes")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Mins</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("goals")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Gls</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("assists")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Ast</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("PKMissed")} style={styles.headerCell}>
                        <Text style={styles.headerText}>PKM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("Goals Against")} style={styles.headerCell}>
                        <Text style={styles.headerText}>GA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("Saves")} style={styles.headerCell}>
                        <Text style={styles.headerText}>Svs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("Yellow Card")} style={styles.headerCell}>
                        <Text style={styles.headerText}>YC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("Red Card")} style={styles.headerCell}>
                        <Text style={styles.headerText}>RC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSort("Clean Sheet")} style={styles.headerCell}>
                        <Text style={styles.headerText}>CS</Text>
                    </TouchableOpacity>
                    </View>

            
                    {/* Player List */}
                    <FlatList
                    data={players}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={{ width: 1000 }} 
                    renderItem={({ item }) => {
                    // console.log("Rendering Player:", item);
                    //console.log("Players Type:", Array.isArray(players), players.length);

                        return (
                        <View style={styles.tableRow}>
                            <TouchableOpacity onPress={() => setSelectedPlayer(item)}>
                                <Text style={styles.addButton}>+</Text>
                            </TouchableOpacity>
                            <Image source={require("./assets/placeholder.png")} style={{ width: 40, height: 40, borderRadius: 25 }} resizeMode="cover"/>                           
                            <Text style={styles.cell}>{item.name}</Text>
                            <Text style={styles.cell}>{item.team}</Text>
                            <Text style={styles.cell}>{item.position}</Text>
                            <Text style={styles.cell}>{item.FantasyPoints}</Text>
                            <Text style={styles.cell}>{item.Minutes}</Text>
                            <Text style={styles.cell}>{item.goals}</Text>
                            <Text style={styles.cell}>{item.assists}</Text>
                            <Text style={styles.cell}>{item.PKMissed}</Text>
                            <Text style={styles.cell}>{item["Goals Against"]}</Text>
                            <Text style={styles.cell}>{item.Saves}</Text>
                            <Text style={styles.cell}>{item["Yellow Cards"]}</Text>
                            <Text style={styles.cell}>{item["Red Cards"]}</Text> 
                            <Text style={styles.cell}>{item["Clean Sheet"]}</Text>
                        </View>

                    )}}
                    />
                </View>
            </ScrollView>
        </View>


              {/* Add Confirmation Modal */}
        <Modal visible={!!selectedPlayer} transparent animationType="slide">
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalText}>{modalMessage || `Add ${selectedPlayer?.name}?`}</Text>
                <View style={styles.modalbutton}>
                    {modalMessage ? (
                    <TouchableOpacity style={styles.buttonStyle} title="Close" onPress={() => {setSelectedPlayer(null); setModalMessage("");}}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>

                    ) : (
                    <>
                    <TouchableOpacity style={styles.buttonStyle} title="Add" onPress={checkAndAddPlayer}>
                        <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} title="Cancel" onPress={() => setSelectedPlayer(null)}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    </>
                    )}
                </View>
            </View>
            </View>
        </Modal>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#121212" },
    title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
    draftButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 20},
    draftButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    searchBar: { backgroundColor: "#333", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 12 },
    filterRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, gap: 15 },
    filterPickerContainer: { flex: 1, backgroundColor: "#222", borderRadius: 12, paddingHorizontal: 2, height: 50, justifyContent: "center" },
    filterPicker: { color: "#fff", width: "100%" },
    filterText: { color: "#121212", fontWeight: "bold", fontSize: 14, textAlign: "center" },
    tableHeader: { flexDirection: "row", backgroundColor: "#444", paddingVertical: 10, height: 50, width: 1000},
    headerCell: { flex: 1, textAlign: "center" },
    headerText: { color: "#fff", fontWeight: "bold", fontSize: 14, textAlign: "center" },
    tableRow: { flexDirection: "row", paddingVertical: 10, borderBottomColor: "#333", borderBottomWidth: 1 },
    cell: { flex: 1, color: "#fff", textAlign: "center", fontSize: 14 },
    
    addButton: { color: "#4CAF50", fontSize: 20, fontWeight: "bold", paddingHorizontal: 10 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center" },
    modalText: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalbutton: { backgroundColor: "1e1e1e", flexDirection: "row", justifyContent: "space-between", width: "40%" },
    buttonStyle: { backgroundColor: "#4CAF50", paddingVertical: 5, paddingHorizontal: 15, borderRadius: 4 },
    buttonText: {color: "#fff"},
  });       



export default PlayerListScreen;
