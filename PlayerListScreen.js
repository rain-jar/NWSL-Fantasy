import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
//import playerDataNew from "./assets/players.json";
import { ScrollView } from "react-native";
//import { ScrollView } from "react-native-gesture-handler";




const PlayerListScreen = ({ playerData, onAdd, teamRoster, navigation }) => {

    const [players, setPlayers] = useState([...playerData]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [modalMessage, setModalMessage] = useState("");

    const [scrollX, setScrollX] = useState(0); // Track scroll position
  
    useEffect(() => {
      filterAndSortPlayers();
    }, [searchQuery, selectedPosition, selectedTeam, sortField, sortOrder]);
  
    const filterAndSortPlayers = () => {
      let filtered = playerData;
  
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
  
      setPlayers(filtered);
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
              <Picker.Item label="Position" value="" />
              <Picker.Item label="FW" value="FW" />
              <Picker.Item label="MF" value="MF" />
              <Picker.Item label="DF" value="DF" />
              <Picker.Item label="GK" value="GK" />
            </Picker>
          </View>
  
          <View style={styles.filterPickerContainer}>
            <Picker selectedValue={selectedTeam} onValueChange={setSelectedTeam} style={styles.filterPicker}>
              <Picker.Item label="Team" value="" />
              {[...new Set(playerData.map((p) => p.team))].map((team) => (
                <Picker.Item key={team} label={team} value={team} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Table Header */}
        <View style={{ flex: 1, padding: 10 }}>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                    <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>        </Text>

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
                            <Text style={styles.cell}>{item["Clean Sheet"] ? "Yes" : "No"}</Text>
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
    filterPickerContainer: { flex: 1, backgroundColor: "#222", borderRadius: 12, paddingHorizontal: 20, height: 50, justifyContent: "center" },
    filterPicker: { color: "#fff", width: "100%" },
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
