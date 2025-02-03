import React from "react";
import MyTeamScreen from "./MyTeamScreen";
import { View, Text, FlatList,  TouchableOpacity, StyleSheet } from "react-native";


const LeagueScreen = ({ users, navigation }) => {
   // console.log("LeagueScreen navigation prop:", navigation);
   // console.log("Available Screens:", navigation.getState().routes);


  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={styles.draftButton} onPress={() => navigation.navigate("Draft")}>
            <View>
                <Text style={styles.draftButtonText}>Draft</Text>
            </View>
        </TouchableOpacity>  
        {/* League Title */}
        <View>
        <Text style={styles.leagueTitle}>Kia Ora League</Text>
        <Text style={styles.subtitle}>Standings</Text>
        </View>
     </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Team Name</Text>
        <Text style={styles.headerCell}>W-L-T</Text>
        <Text style={styles.headerCell}>PF</Text>
      </View>


      {/* Team List */}
      {users.length === 0 ? (
        <Text style={styles.noTeamsText}>No teams yet. Create a profile to join!</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
                <TouchableOpacity onPress={() => navigation.navigate("MainTabs", { screen: "My Team" })}>
                <View style={styles.tableRow}>
                    <View style={styles.teamNameContainer}>
                        <Text style={styles.teamName}>{String(item.teamName || "No Team Name")}</Text>
                        <Text style={styles.userName}>@{String(item.userName || "No Team Name")}</Text>
                    </View>
                    <Text style={styles.cell}>0-0-0</Text>  {/* Placeholder W-L-T */}
                    <Text style={styles.cell}>0</Text>      {/* Placeholder PF */}
                </View>
                </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#1E1E1E" },
  draftButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, alignSelf: "center", marginBottom: 10 },
  draftButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  leagueTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "left" },
  subtitle: { fontSize: 18, color: "#ccc", textAlign: "left", marginBottom: 10 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#444", paddingBottom: 8 },
  headerCell: { flex: 1, color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
  noTeamsText: { color: "#ccc", textAlign: "center", marginTop: 20 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333", paddingVertical: 10 },
  teamNameContainer: { flex: 1, alignItems: "center" },
  teamName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  userName: { color: "#bbb", fontSize: 14 },
  cell: { flex: 1, color: "#fff", fontSize: 16, textAlign: "center" },
});

export default LeagueScreen;
