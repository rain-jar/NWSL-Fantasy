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
import { subscribeToUserAndPlayerUpdates } from "./supabaseListeners";
import TeamViewScreen from "./TeamViewScreen";




const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();

function MainTabs( { navigation, currentUser, users, updateUserRoster, availablePlayers, setAvailablePlayers } ) {

  console.log("In Main Tabs");
  console.log(availablePlayers);

  const [team1Roster, setTeam1Roster] = useState([]); // State for drafted players
  const userProfile = {
    teamName : currentUser.teamName,
    userName : currentUser.userName,
  };

  //console.log("Players Data:", playerData[0]);

  const updatePlayerList = (player) => {
     setAvailablePlayers((prev) => prev.filter((p) => p.name !== player.name));
  };

  const handleDrop = async(player) => {
    //setTeam1Roster((prevRoster) => prevRoster.filter((p) => p.name !== player.name));

      // ** Fetch current roster**
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("roster")
      .eq("id", currentUser.id)
      .single(); // Ensures we get only one row

    if (fetchError) {
      console.error("Error fetching roster:", fetchError);
      return;
    }

    const currentRoster = data?.roster || []; 
    const updatedRoster = currentRoster.filter((p) => p.name !== player.name);

    // Update roster in Supabase
    console.log("🔍 Before updating availablePlayers:", availablePlayers);
    const { error: rosterError } = await supabase
      .from("users")
      .update({ roster: updatedRoster })
      .eq("id", currentUser.id);

    if (rosterError) {
      console.error("Error updating roster:", rosterError);
      return;
    }

        // Add player back to availablePlayers in Supabase
    console.log("🔍 Before inserting playerList:", availablePlayers);
    const { error: playerError } = await supabase
      .from("players_base")
      .update({ onroster: false })
      .eq("name", player.name);
      console.log("Player: "+player.name+"'s onRoster status is false in the players table in Supabase")


    if (playerError) {
      console.error("Error adding player back:", playerError);
     return;
    }

   // updateUserRoster(currentUser.id, (prevRoster) =>prevRoster.filter((p) => p.name !== player.name) );
   // setAvailablePlayers((prevPlayers) => [...prevPlayers, player]); // Add back to Player List
  };
  
  const handleAddPlayer = async(player) => {

    // Remove player from Supabase's players table
    /*
    const { error } = await supabase.from("players").delete().eq("name", player.name);

    if (error) {
      console.error("Error removing player:", error);
    }
    */

  // ** Fetch current roster**
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("roster")
      .eq("id", currentUser.id)
      .single(); // Ensures we get only one row

    if (fetchError) {
      console.error("Error fetching roster:", fetchError);
      return;
    }

    const currentRoster = data?.roster || []; 
      // **Append new player**
    const updatedRoster = [...currentRoster, player];


    const { error: rosterError } = await supabase
      .from("users")
      .update({ roster: updatedRoster })
      .eq("id", currentUser.id);

    if (rosterError) {
      console.error("Error updating roster:", rosterError);
    }    

    // Remove player from availablePlayers in Supabase
    const { error: playerError } = await supabase
    .from("players_base")
    .update({ onroster: true })
    .eq("name", player.name);
    console.log("Player: "+player.name+"'s onRoster status is set to true in Supabase")


   // setAvailablePlayers((prev) => prev.filter((p) => p.name !== player.name));
   // updateUserRoster(currentUser.id, (prevRoster) => [...prevRoster, player]);

   // setTeam1Roster((prevRoster) => [...prevRoster, player]); // Add player to My Team
  };


  return (
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
            <PlayerListScreen key={availablePlayers.length} playerData={availablePlayers} onAdd={handleAddPlayer} teamRoster={currentUser.roster}/>
          );
        }}
      </Tab.Screen>

      <Tab.Screen name="My Team">
        {() => {
          console.log("Rendering My Team", currentUser.roster);
          return(
          <View style={{ flex: 1 }}>
            <MyTeamScreen 
              roster={currentUser.roster} 
              onDrop={handleDrop} 
              userProfile={currentUser} 
              navigation={navigation}
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
        {() => (
          <LeagueScreen users={users} navigation = {navigation} currentUser={currentUser}/>
        )}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

const App = () => {
  const [users, setUsers] = useState<{ id: number; teamName: string; userName: string; roster: any[] }[]>([]);; // Store multiple users
  //const [userProfile, setUserProfile] = useState([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);


  useEffect(() => {
    const unsubscribe = subscribeToUserAndPlayerUpdates(setUsers, setAvailablePlayers);
    supabase.getChannels().forEach(channel => console.log("Active channel:", channel));
    return () => unsubscribe(); // Cleanup
  }, []);


    // Fetch players from Supabase on app start
  const fetchPlayersFromDB = async () => {
    const { data, error } = await supabase.from("players_base").select("*").eq("onroster", false);;
    if (error) {
      console.error("Error fetching players:", error);
    } else {
      console.log("App.tsx renders and loads sets Available List")
      setAvailablePlayers(data); 

    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
  }, []);

  // Function to fetch user data from Supabase
  const fetchUsersFromDB = async () => {
    const { data, error } = await supabase.from("users").select("*"); // Fetch all users
    if (error) {
      console.error("Error fetching users from Supabase:", error);
    } else {
      setUsers(data);
    }
  };



    // Fetch users when the app starts
    useEffect(() => {
      fetchUsersFromDB();
    }, []);


    useEffect(() => {
      console.log("Users updated:", users); // Check if state updates when listener fires
    }, [users]);
    

  const addUser = async(teamName, userName) => {
    const newUser = {
      team_name: teamName,
      user_name: userName,
      roster: [],
    };

    // Insert new user into Supabase
    const { data, error } = await supabase.from("users").insert([newUser]).select();

    if (error) {
      console.error("Error saving user:", error);
      alert("Failed to save profile. Try again.");
      return;
    }else{}

    setUsers([...users, data[0]]);
    setCurrentUserId(data[0].id);

  };

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
  const temp = users?.find((user) => user.id === currentUserId) || null;
  console.log("curret User Id is: ", temp?.team_name);
  const currentUser = users?.find((user) => user.id === currentUserId) || null;
  console.log("User after check: ", currentUser?.user_name)
//  console.log("Available Players in App.tsx: ", availablePlayers);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <Stack.Screen name="ProfileScreen">
              {({ navigation }) => (
              <ProfileScreen navigation = {navigation} onSave={addUser} />)}
          </Stack.Screen>
          <Stack.Screen name="ProfileList">
              {({ navigation }) => 
                <ProfileList users={users} onSelect={setCurrentUserId} navigation={navigation} />}
          </Stack.Screen>

          {/* Main App (Shown Only After Login) */}
          <Stack.Screen name="MainTabs">
            {({ navigation }) =>
              currentUserId ? (
                <MainTabs currentUser={currentUser} users={users} updateUserRoster={updateUserRoster}  availablePlayers={availablePlayers} setAvailablePlayers={setAvailablePlayers} navigation={navigation} />
              ) : (
                <WelcomeScreen navigation={navigation} />
              )
            }
          </Stack.Screen>

          <Stack.Screen name="TeamView" component={TeamViewScreen} />

          



          <Stack.Screen name="Draft">
            {(navigation) => (
                <DraftScreen
                    availablePlayers={availablePlayers}
                    setAvailablePlayers={setAvailablePlayers}
                    onPick={(player) => setAvailablePlayers((prev) => prev.filter((p) => p.name !== player.name))}
                    //onNotify={(updateFn) => updateUserRoster(currentUser.id, updateFn)} 
                    currentUser={currentUser}
                    users={users}
                    updateUserRoster={updateUserRoster}
                   // navigation = {navigation}
                />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;



