import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import WelcomeScreen from "./WelcomeScreen";
import ProfileScreen from "./ProfileScreen";
import PlayerListScreen from "./PlayerListScreen";
import DraftScreen from "./DraftScreen";
import MyTeamScreen from "./MyTeamScreen";
import playerData from "./assets/Matchday1Stats.json";
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();

function MainTabs( { currentUser, users, updateUserRoster } ) {

  const [availablePlayers, setAvailablePlayers] = useState([...playerData]);
  const [team1Roster, setTeam1Roster] = useState([]); // State for drafted players
  const userProfile = {
    teamName : currentUser.teamName,
    userName : currentUser.userName,
  };

  //console.log("Players Data:", playerData[0]);

  const updatePlayerList = (player) => {
    setAvailablePlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name)); 
  };

  const handleDrop = (player) => {
    setTeam1Roster((prevRoster) => prevRoster.filter((p) => p.name !== player.name));
    setAvailablePlayers((prevPlayers) => [...prevPlayers, player]); // Add back to Player List
  };
  
  const handleAddPlayer = (player) => {
    setAvailablePlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name));
    setTeam1Roster((prevRoster) => [...prevRoster, player]); // Add player to My Team
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
            //userProfile={currentUser}
            users={users}
            updateUserRoster={updateUserRoster} 
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="My Team">
        {() => <MyTeamScreen roster={currentUser.roster} onDrop={handleDrop} userProfile={currentUser} />}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

const App = () => {
  const [users, setUsers] = useState<{ id: number; teamName: string; userName: string; roster: any[] }[]>([]);; // Store multiple users
  //const [userProfile, setUserProfile] = useState([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const addUser = (teamName, userName) => {
    console.log(userName);
    const newUser = {
      id: users.length + 1,
      teamName: teamName,
      userName: userName,
      roster: [],
    };
    setUsers([...users, newUser]);
    setCurrentUserId(newUser.id);

  };

  const updateUserRoster = (userId, newRoster) => {
    setUsers((prevUsers) => prevUsers.map((user) => 
      user.id === userId ? { ...user, roster: typeof newRoster === "function" ? newRoster(user.roster) : newRoster } : user
      )
    );
    const temp = users.find((user) => user.id === userId);
    console.log(temp.teamName);

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
          <Stack.Screen name="LoginScreen">
                {({ navigation }) => <LoginScreen users={users} onSelect={setCurrentUserId} navigation={navigation} />}
              </Stack.Screen>
          <Stack.Screen name="MainTabs">
            {() => <MainTabs currentUser={currentUser} users={users} updateUserRoster={updateUserRoster} />}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;



