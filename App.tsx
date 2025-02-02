import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import WelcomeScreen from "./WelcomeScreen";
import ProfileScreen from "./ProfileScreen";
import PlayerListScreen from "./PlayerListScreen";
import ProfileList from "./ProfileList";
import DraftScreen from "./DraftScreen";
import MyTeamScreen from "./MyTeamScreen";
import playerData from "./assets/Matchday1Stats.json";
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();

function MainTabs( { navigation, currentUser, users, updateUserRoster, availablePlayers, setAvailablePlayers } ) {

  //console.log("In Main Tabs");

  const [team1Roster, setTeam1Roster] = useState([]); // State for drafted players
  const userProfile = {
    teamName : currentUser.teamName,
    userName : currentUser.userName,
  };

  //console.log("Players Data:", playerData[0]);

  const updatePlayerList = (player) => {
     setAvailablePlayers((prev) => prev.filter((p) => p.name !== player.name));
  };

  const handleDrop = (player) => {
    //setTeam1Roster((prevRoster) => prevRoster.filter((p) => p.name !== player.name));
    setAvailablePlayers((prevPlayers) => [...prevPlayers, player]); // Add back to Player List
  };
  
  const handleAddPlayer = (player) => {
    setAvailablePlayers((prev) => prev.filter((p) => p.name !== player.name));
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
        {() => <PlayerListScreen key={availablePlayers.length} playerData={availablePlayers} onAdd={handleAddPlayer} teamRoster={currentUser.roster}/>}
      </Tab.Screen>


      <Tab.Screen name="Draft">
        {() => (
          <DraftScreen
            playerList={availablePlayers}
            onPick={updatePlayerList}
            //onNotify={(updateFn) => updateUserRoster(currentUser.id, updateFn)} 
            currentUser={currentUser}
            users={users}
            updateUserRoster={updateUserRoster} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="My Team">
        {() => (
          <View style={{ flex: 1 }}>
            <MyTeamScreen 
              roster={currentUser.roster} 
              onDrop={handleDrop} 
              userProfile={currentUser} 
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
        )}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

const App = () => {
  const [users, setUsers] = useState<{ id: number; teamName: string; userName: string; roster: any[] }[]>([]);; // Store multiple users
  //const [userProfile, setUserProfile] = useState([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState([...playerData]);


  const addUser = (teamName, userName) => {
    const newUser = {
      id: users.length + 1,
      teamName: teamName,
      userName: userName,
      roster: [],
    };
    setUsers([...users, newUser]);
    setCurrentUserId(newUser.id);
    //console.log("App.tsx back to Profile");
  };

  const updateUserRoster = (userId, newRoster) => {
    setUsers((prevUsers) => prevUsers.map((user) => 
      user.id === userId ? { ...user, roster: typeof newRoster === "function" ? newRoster(user.roster) : newRoster } : user
      )
    );
    const temp = users.find((user) => user.id === userId);
    //console.log(temp.teamName);

  };

  const currentUser = users.find((user) => user.id === currentUserId);

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


        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;



