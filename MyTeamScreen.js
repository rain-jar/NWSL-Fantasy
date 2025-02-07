import React from "react";
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from "react-native";

const MyTeamScreen = ({ roster, onDrop, userProfile, navigation}) => {
    

    const [selectedPlayer, setSelectedPlayer] = useState(null);

     // Example team data
    const teamName = userProfile?.teamName;
    const userName = userProfile?.userName;
    console.log(teamName);
    console.log(userName);


    const positionOrder = { GK: 1, DF: 2, MF: 3, FW: 4 };

    const sortedRoster = [...roster].sort((a, b) => {
    const posA = a.position.split("-")[0]; // Use first position for hybrid roles
    const posB = b.position.split("-")[0];
    return positionOrder[posA] - positionOrder[posB];
    });

  return (
    <View style={styles.container}>
      {/* Team Name and Username */}
      <View style={styles.headerContainer}>
        <Text style={styles.teamName}>{teamName || "No Team Name"}</Text>
        <Text style={styles.username}>@{userName || "No Team Name"}</Text>
      </View>


      

      {/* Team Players Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Pos</Text>
          <Text style={styles.headerCell}>Name</Text>
          <Text style={styles.headerdataCell}>Fpts</Text>
        </View>



        <FlatList
          data={sortedRoster}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedPlayer(item)}>
                <View style={styles.tableRow}>
                    <Text style={styles.cell}>{item.position}</Text>
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

  tableContainer: { marginTop: 10 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 8,
    width : "%100"
  },
  headerCell: { flex: 1, color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "left", width : 10 },
  headerdataCell: { flex: 1, color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "right", width : 10 },


  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 10,
    alignItems: "center",
    width : "%100"
  },
  cell: { flex: 1, color: "#fff", fontSize: 16, textAlign: "left", width: 10},
  datacell: { flex: 1, color: "#fff", fontSize: 16, textAlign: "right", width: 20},


  playerNameContainer: { flex: 1, justifyContent: "left" },
  playerName: { color: "#fff", fontSize: 16, textAlign: "left" },
  tableSmallRow: { flexDirection: "row", alignItems: "left", marginTop: 2},
  teamNameSmall: { color: "#bbb", fontSize: 14, textAlign: "left", marginTop: 2 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#1E1E1E", padding: 20, borderColor:"#4CAF50", borderRadius: 10, borderWidth: 1,  alignItems: "center" },
  modalText: { color:"#fff",fontSize: 18, fontWeight: "bold", marginBottom: 10, paddingBottom:10 },
  modalbutton: { backgroundColor: "1e1e1e", flexDirection: "row", justifyContent: "space-between", width: "40%" },
  buttonStyle: { backgroundColor: "#4CAF50", paddingVertical: 5, paddingHorizontal: 15, borderRadius: 4 },
  buttonText: {color: "#fff"},
});

export default MyTeamScreen;


