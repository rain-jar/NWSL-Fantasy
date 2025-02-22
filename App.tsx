import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import WelcomeScreen from "./WelcomeScreen";
import ProfileScreen from "./ProfileScreen";
import PlayerListScreen from "./PlayerListScreen";
import LeagueScreen from "./LeagueScreen";
import ProfileList from "./ProfileList";
import DraftScreen from "./DraftScreen";
import MyTeamScreen from "./MyTeamScreen";
import playerData from "./assets/Matchday1Stats.json";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from "react";
import supabase from "./supabaseClient"; 
import TeamViewScreen from "./TeamViewScreen";
import CreateJoinScreen from "./CreateJoinScreen";
import LeagueSetupScreen from "./LeagueSetupScreen";
import {subscribeToUserInserts} from "./supabaseListeners";
import { LeagueProvider, useLeague } from "./LeagueContext";



const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();

function MainTabs( { navigation, currentUser, users } ) {

  console.log("MainTabs sees leagueContext:", useLeague());

  const { availablePlayers, setAvailablePlayers, leagueId } = useLeague();
  const { leagueParticipants, setLeagueParticipants} = useLeague();

 // const [leagueParticipants, setLeagueParticipants] = useState([]);
  const [currentUserData, setcurrentUserData] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [playerUpdateTrigger, setPlayerUpdateTrigger] = useState(0);


  const [isDataFetched, setIsDataFetched] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state


  console.log("In Main Tabs", leagueId);

  //Fetching League Available Players, User Team in this League and PlayerStats info. 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchLeaguePlayerData();
      await fetchUserLeagueData();
      await fetchPlayerStats();
      setLoading(false);
    };
  
    if (leagueId) {
      fetchData();
    }
  }, []);

  const fetchLeaguePlayerData = async () => {
    try {
      const { data, error } = await supabase
        .from("league_players")
        .select("*")
        .eq("league_id", leagueId)
        .eq("onroster", false);
  
      if (error) {
        console.error("❌ Error fetching league-user roster data", error.message);
        return [];
      }
  
      console.log("✅ League-Player data is fetched:", data);
      setAvailablePlayers(data);
      return;


    } catch (err) {
      console.error("🔥 Unexpected error fetching leagues:", err);
      return [];
    }
  };

  const fetchUserLeagueData = async () => {
    try {
      const { data, error } = await supabase
        .from("league_rosters")
        .select("*")
        .eq("league_id", leagueId); 
  
      if (error) {
        console.error("❌ Error fetching league-user roster data", error.message);
        return [];
      }
      const currentUserDataTemp = data.find((p) => p.user_id === currentUser.id);
      console.log("✅ League-User data is fetched:", currentUserDataTemp);
      console.log("League has the following teams :", data);
      setLeagueParticipants(data);
      setcurrentUserData(currentUserDataTemp);
      return;

    } catch (err) {
      console.error("🔥 Unexpected error fetching leagues:", err);
      return [];
    }
  };

  const fetchPlayerStats = async () => {
    if (!isDataFetched) {
      console.log("Fetching Player Stats...");
      const { data, error } = await supabase.from("players_base").select("*");
      if (error) {
        console.error("Error fetching player stats:", error);
        return;
      }
      setPlayerStats(data);
      setIsDataFetched(true);
      console.log("Players Base data is fetched in App.tsx",data );
    }
  };

  useEffect(() => {
    console.log("League Participants are : ", leagueParticipants);
    console.log("Available Players after Player Draft is ", availablePlayers);
  }, [leagueParticipants, availablePlayers]);

  console.log("Checking available players ", availablePlayers);
  console.log("Checking Roster data ", currentUserData);
  console.log("Again Checking on leagueTeams", leagueParticipants);
  console.log("Checking Player Stats ", playerStats);
  console.log("Loading ", loading);

  const handleDrop = async(player) => {
    //setTeam1Roster((prevRoster) => prevRoster.filter((p) => p.name !== player.name));

    const currentRoster = leagueParticipants.find((participant) => participant.user_id == currentUser.id).roster || []; 
    
    const updatedRoster = currentRoster.filter((p) => p.player_id !== player.id);

    // Update roster in Supabase
    console.log("🔍 Before updating availablePlayers:", availablePlayers);
    const { error: rosterError } = await supabase
      .from("league_rosters")
      .update({ roster: updatedRoster })
      .eq("league_id", leagueId)
      .eq("user_id",currentUser.id);

    if (rosterError) {
      console.error("Error updating roster:", rosterError);
      return;
    }

        // Add player back to availablePlayers in Supabase
    console.log("🔍 Before inserting playerList:", availablePlayers);
    const { error: playerError } = await supabase
      .from("league_players")
      .update({ onroster: false })
      .eq("player_id", player.id)
      .eq("league_id", leagueId);
      console.log("Player: "+player.name+"'s onRoster status is false in the players table in Supabase")


    if (playerError) {
      console.error("Error adding player back:", playerError);
     return;
    }

   // updateUserRoster(currentUser.id, (prevRoster) =>prevRoster.filter((p) => p.name !== player.name) );
   // setAvailablePlayers((prevPlayers) => [...prevPlayers, player]); // Add back to Player List
  };
  
  const handleAddPlayer = async(player) => {

    const currentRoster = leagueParticipants.find((participant) => participant.user_id == currentUser.id).roster || []; 
    const currentPlayer = {
      "league_id": player.league_id,
      "name": player.name,
      "onroster": player.onroster,
      "player_id": player.player_id,
      "position": player.position,
    }
      // **Append new player**
    const updatedRoster = [...currentRoster, currentPlayer];


    const { error: rosterError } = await supabase
      .from("league_rosters")
      .update({ roster: updatedRoster })
      .eq("league_id", leagueId)
      .eq("user_id",currentUser.id);

    if (rosterError) {
      console.error("Error updating roster:", rosterError);
    }    

    // Remove player from availablePlayers in Supabase
    const { error: playerError } = await supabase
    .from("league_players")
    .update({ onroster: true })
    .eq("player_id", player.player_id)
    .eq("league_id", leagueId);
    console.log("Player: "+player.name+"'s onRoster status is set to true in Supabase")


   // setAvailablePlayers((prev) => prev.filter((p) => p.name !== player.name));
   // updateUserRoster(currentUser.id, (prevRoster) => [...prevRoster, player]);

   // setTeam1Roster((prevRoster) => [...prevRoster, player]); // Add player to My Team
  };


  return (

    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>Loading League Data...</Text>
        </View>
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: "#121212" },
            tabBarIndicatorStyle: { backgroundColor: "#4CAF50" },
            tabBarLabelStyle: { color: "#fff", fontWeight: "bold" },
          }}
        >
          <Tab.Screen name="Players"> 
            {() => {
              console.log("Rendering PlayerScreen");
              return(
                <PlayerListScreen onAdd={handleAddPlayer} teamRoster={currentUserData} playerBase={playerStats} />
              );
            }}
          </Tab.Screen>

          <Tab.Screen name="My Team">
            {() => {
              console.log("Rendering My Team", currentUserData);
              return(
              <View style={{ flex: 1 }}>
                <MyTeamScreen 
                  key={availablePlayers.length}
                  onDrop={handleDrop} 
                  userProfile={currentUser} 
                  navigation={navigation}
                  playerBase={playerStats}
                />
                <TouchableOpacity 
                  onPress={() => {
                    //console.log("Going back to Welcome");
                    navigation.reset({ index: 0, routes: [{ name: "WelcomeScreen" }] });
                  }}
                  style={{ margin: 20, padding: 10, backgroundColor: "#f55" }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>Switch User</Text>
                </TouchableOpacity>
              </View>
            );
            }}
          </Tab.Screen>

          <Tab.Screen name="League">
            {() => {
              console.log("Rendering League page");
              console.log("Available Players ", availablePlayers);
              return(
                <LeagueScreen navigation = {navigation} currentUser={currentUser} />
              )}
            } 
          </Tab.Screen>

        </Tab.Navigator>
      )}
    </View>
  );
}

const App = () => {
  const [users, setUsers] = useState<{ id: number; user_name: string }[]>([]);; // Store multiple users
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);

 // const [userLeagues , setUserLeagues] = useState([]);
/*
 useEffect(() => {
  const unsubscribe = subscribeToUserInserts(setUsers);
  supabase.getChannels().forEach(channel => console.log("Active channel:", channel));
  return () => unsubscribe(); // Cleanup
}, []);
*/

  console.log("In App.tsx");
  console.log("Checking users: ", users);

  const currentUser = users.find((p) => p.id === currentUserId) || null;

  console.log("Checking on the following details : ", currentUser, currentUserId)


  //Fetching Users List
  const fetchUserList = async() => {
    try {
      const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*");
  
      if (userError) {
        console.error("❌ Error fetching userlist:", userError.message);
        return;
      }
      console.log("Fetched current userlist: ", userData);
  
      setUsers(userData);
      console.log("Users updated:", users); // Check if state updates when listener fires
    } catch (err) {
      console.error("🔥 Unexpected error fetching leagues:", err);
      return [];
    }
  }

  useEffect(() => {
    fetchUserList ();
  }, []);


  useEffect(() => {
    console.log("User are updated to ",users)
  }, [users])
  //If a new user is being added, then adding that user into the UserList
  //Also setting them to the currentUser and currentUserId.   
  const addUser = async(userName) => {
    console.log("Adding a New user", userName);

    const newUser = {
      user_name: userName
    };

    // Insert new user into Supabase
    console.log("Adding a User");
    const { data, error } = await supabase.from("users").insert([newUser]).select();

    if (error) {
      console.error("Error saving user:", error);
      alert("Failed to save profile. Try again.");
      return;
    }else{}

    setUsers([...users, data[0]]);
    //setCurrentUser(data[0]);
    setCurrentUserId(data[0].id);
    console.log("Set the following details : ", data, currentUserId)

  };

  const onUserSelect = async(userId) => {
    console.log("Inside UserSelect");
    setCurrentUserId(userId);
  }

  const updateUserRoster = async(userId, newRoster) => {

    // Update roster in Supabase
    const { error } = await supabase.from("users").update({ roster: newRoster }).eq("id", userId);

    if (error) {
      console.error("Error updating roster:", error);
      return;
    }

    setUsers((prevUsers) => prevUsers.map((user) => 
      user.id === userId ? { ...user, roster: typeof newRoster === "function" ? newRoster(user.roster) : newRoster } : user
      )
    );
    const temp = users.find((user) => user.id === userId);
    //console.log(temp.teamName);

  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LeagueProvider leagueId={selectedLeagueId} userId={currentUserId}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="ProfileScreen">
                {({ navigation }) => (
                <ProfileScreen navigation = {navigation} onSave={addUser} />)}
            </Stack.Screen>
            <Stack.Screen name="ProfileList">
                {({ navigation }) => 
                  <ProfileList onSelect={onUserSelect} navigation={navigation} />}
            </Stack.Screen>
            <Stack.Screen name="CreateJoinScreen">
              {({ navigation }) => {
                console.log("Rendering CreateJoinScreen ");
                return(
                <CreateJoinScreen 
                  currentUser={currentUser} 
                  navigation={navigation} 
                  onLeagueChosen={(newLeagueId) => setSelectedLeagueId(newLeagueId)}
                />
              );}}
            </Stack.Screen>
            <Stack.Screen name="LeagueSetupScreen">
              {({ navigation, route }) => (
                <LeagueSetupScreen  
                  navigation={navigation} 
                  route = {route}
                  onLeagueChosen={(newLeagueId) => setSelectedLeagueId(newLeagueId)}
                />
              )}
            </Stack.Screen>
            {/* Main App (Shown Only After Login) */}
            <Stack.Screen name="MainTabs">
              {({ navigation, route }) =>
                currentUserId ? (
                  <MainTabs currentUser={currentUser} navigation={navigation} users={users}/>
                ) : (
                  <WelcomeScreen navigation={navigation} />
                )
              }
            </Stack.Screen>
            <Stack.Screen name="TeamView" component={TeamViewScreen} />
            <Stack.Screen name="Draft">
              {({navigation, route}) => (
                  <DraftScreen
                  //  onPick={player}
                      //onNotify={(updateFn) => updateUserRoster(currentUser.id, updateFn)} 
                      currentUser={currentUser}
                      users={users}
                      key = {route.params?.key}
                      navigation = {navigation}
                  />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </LeagueProvider>
    </GestureHandlerRootView>
  );
};

export default App;



