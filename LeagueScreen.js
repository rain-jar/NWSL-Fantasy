import React, { useState, useEffect } from "react";
import MyTeamScreen from "./MyTeamScreen";
import { View, Text, FlatList,  TouchableOpacity, StyleSheet } from "react-native";
import supabase from "./supabaseClient"; 
import { LeagueProvider, useLeague } from "./LeagueContext";



const LeagueScreen = ({ navigation, currentUser }) => {

  const { leagueParticipants, setLeagueParticipants, leagueId, users} = useLeague();
  

  const [isDataFetched, setIsDataFetched] = useState(false);
  const [leagueName, setLeagueName] = useState();
  const [loading, setLoading] = useState(false); // Add loading state
  const [leagueUsers, setleagueUsers] = useState([...leagueParticipants]);
  

  console.log("Checking on league teams ", leagueParticipants);
  console.log("Checking on current User ", currentUser);
 // console.log("Checking on available players ", availablePlayers);
  console.log("Checking on User Table ", users);
  console.log("is LeagueName fetched ", isDataFetched);
  console.log("League Id is ", leagueId);

  useEffect(() => {
    const fetchName = async () => {
      await fetchLeagueName();
      await fetchleagueUsers();
    };
    fetchName();
  }, []);

  useEffect(()=> {
    fetchleagueUsers();
  },[leagueParticipants])

  const fetchleagueUsers = async() => {
    const leagueUsersTemp = leagueParticipants.map((participant) => {
      const username = users.find((m) => m.id === participant.user_id).user_name || {};
      return {
        ...participant, 
        user_name : username || "",
      };
    });
    setleagueUsers(leagueUsersTemp);
  }


  console.log ("This is ",leagueUsers);

  const fetchLeagueName = async () => {
    try{
      if (!isDataFetched) {
        console.log("Fetching LeagueName...");
        const { data, error } = await supabase.from("leagues").select("*").eq("league_id", leagueId);
        if (error) {
          console.error("Error fetching player stats:", error.message);
          return;
        }
        console.log("League Name fetched is ",data[0]);

        setLeagueName(data[0].league_name);
        setIsDataFetched(true);
      }
    } catch (err) {
      console.error("🔥 Unexpected fetch error:", err);
    }
  };

    const handleTeamClick = (team) => {
        if (team.user_id === currentUser.id) {
          // If it's the current user's team, navigate to My Team tab
          navigation.navigate("MainTabs", { screen: "My Team" });
        } else {
          // If it's another user's team, navigate to TeamViewScreen
          navigation.navigate("TeamView", { team });
        }
    };


  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>Loading League Data...</Text>
        </View>
       ) : (
        <View style={styles.container}>
          <View>
            <TouchableOpacity style={styles.draftButton} onPress={() => navigation.navigate("Draft", {leagueUsers})}>
                <View>
                    <Text style={styles.draftButtonText}>Draft</Text>
                </View>
            </TouchableOpacity>  
            {/* League Title */}
            <View>
            <Text style={styles.leagueTitle}>{leagueName}</Text>
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
          {leagueUsers.length === 0 ? (
            <Text style={styles.noTeamsText}>No teams yet</Text>
          ) : (
            <FlatList
              data={leagueUsers}
              keyExtractor={(item) => (item?.id ? item.id.toString() : Math.random().toString())}
              renderItem={({ item }) => (
                <View>
                    <TouchableOpacity onPress={() => handleTeamClick(item)}>
                    <View style={styles.tableRow}>
                        <View style={styles.teamNameContainer}>
                            <Text style={styles.teamName}>{String(item.team_name || "No Team Name")}</Text>
                            <Text style={styles.userName}>@{String(item.user_name || "No Team Name")}</Text>
                        </View>
                        <Text style={styles.cell}>0-0-0</Text>  
                        <Text style={styles.cell}>0</Text>   
                    </View>
                    </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
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


