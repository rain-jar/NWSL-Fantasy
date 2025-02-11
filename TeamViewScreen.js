import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const TeamViewScreen = ({ route }) => {
  const { team } = route.params; // Get selected team data

  const positionOrder = { GK: 1, DF: 2, MF: 3, FW: 4 };

  const sortedRoster = [...team.roster].sort((a, b) => {
  const posA = a.position.split("-")[0]; // Use first position for hybrid roles
  const posB = b.position.split("-")[0];
  return positionOrder[posA] - positionOrder[posB];
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>      
        <Text style={styles.teamName}>{team.team_name}</Text>
        <Text style={styles.username}>@{team.user_name}</Text>
      </View>      

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Pos</Text>
          <Text style={styles.headerCell}>Name</Text>
          <Text style={styles.headerdataCell}>Fpts</Text>
        </View>

        <FlatList
          data={sortedRoster}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
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
          )}
        />
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

});

export default TeamViewScreen;
