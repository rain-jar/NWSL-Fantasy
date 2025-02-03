import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PlayerRow from "./PlayerRow";
import TeamRoster from "./TeamRoster";
import playerData from "./assets/players.json";



let currentRound = 1;
let currentPick = 0;
let draftOrder = []; // Initialize draft order



const DraftScreen = ({ playerList, onPick, currentUser, users, updateUserRoster }) => {

    const navigation = useNavigation();

    const [players, setPlayers] = useState(playerList);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [draftTurn, setdraftTurn] = useState(false);
    

    const teams = users.map((user) => ({
        id: user.id,
        name: user.teamName,
        roster: user.roster,
      }));

    if(currentRound === 1 && currentPick === 0){
        draftOrder = [...teams]; // Set it once and for all 
    }

// Position Constraints
    const maxPlayersPerTeam = 11;
    const minPositions = { FW: 1, MF: 3, DF: 3, GK: 1 };
    const maxPositions = { FW: 4, MF: 5, DF: 5, GK: 1 };


    const [currentTeam, setCurrentTeam] = useState(draftOrder[currentPick]);


// Helper Functions
    const nextTurn = () => {
        console.log('came to update after pick'+currentPick+' and draft size is'+draftOrder.length);
        if (currentPick < draftOrder.length - 1) {
            currentPick++;
            console.log('now its pick '+ currentPick);
        } else {
            currentRound++;
            draftOrder.reverse(); // Reverse the draft order for the next round
            currentPick = 0;
            console.log("Pick order has reversed. Current Pick is " + currentPick);
        }
    }

    const isValidPick = (team, player) => {
        const positionCount = {
            FW: team.roster.filter(p => p.position.includes("FW")).length,
            MF: team.roster.filter(p => p.position.includes("MF")).length,
            DF: team.roster.filter(p => p.position.includes("DF")).length,
            GK: team.roster.filter(p => p.position.includes("GK")).length
        };

        // Position constraints
        if (player.position.includes("GK") && positionCount.GK >= maxPositions.GK) return false;
        if (team.roster.length >= maxPlayersPerTeam) return false;

        if (team.roster.length < maxPlayersPerTeam) {
            const playerPositions = player.position.split("-");
            const canFit = playerPositions.some(pos => positionCount[pos] < maxPositions[pos]);
            if (!canFit) return false;
        }

            // **Min Position Check**: If the team is reaching 11 players, ensure all min requirements are met
            if (team.roster.length === maxPlayersPerTeam - 1) {
                for (const pos in minPositions) {
                if (positionCount[pos] < minPositions[pos] && !player.position.includes(pos)) {
                    return false; // This pick would make the team invalid
                }
                }
            }

        return true;
    }

    const draftPlayer = (teamId, player, playerList, teams) => {
        const team = teams.find(t => t.id === teamId);

        if (!team || !playerList.includes(player) || !isValidPick(team, player)) {
            console.log(`Invalid pick: ${player.name}`);
            return false;
        }

        // Assign player position
        let assignedPosition = player.position;
        if (player.position.includes("-")) {
            const possiblePositions = player.position.split("-");
            assignedPosition = possiblePositions.find(pos => team.roster.filter(p => p.position.includes(pos)).length < maxPositions[pos]) || possiblePositions[0];
        }

        team.roster.push({ ...player, assignedPosition });
        playerList = playerList.filter(p => p !== player);
        console.log(`${team.name} drafted ${player.name} as ${assignedPosition}`);

        nextTurn();
        return true;
    }

// DraftScreen Component

    const handleDraft = (player) => {
        console.log("Drafting team is "+ currentTeam.name);

        if (currentUser.id != currentTeam.id){
            console.log ("It's not the current user's turn");
            setdraftTurn(true);
            return false;
        }
        const team = teams.find(t => t.id === currentTeam.id);

        if (!team || !playerList.includes(player) || !isValidPick(team, player)) {
            console.log(`Invalid pick: ${player.name}`);
            return false;
        }

        let assignedPosition = player.position;
        if (player.position.includes("-")) {
            const possiblePositions = player.position.split("-");
            assignedPosition = possiblePositions.find(pos => team.roster.filter(p => p.position.includes(pos)).length < maxPositions[pos]) || possiblePositions[0];
        }


    //    const success = draftPlayer(currentTeam.id, player, playerList, teams);
    //    if (success) {
            updateUserRoster(currentTeam.id, (prevRoster) => [...prevRoster, { ...player, assignedPosition }]);

            setPlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name));
            console.log(`${team.name} drafted ${player.name} as ${assignedPosition}`);


        //setPlayers([...playerList]); // Update available players
        // if (currentTeam.id === 1) {
                //onNotify([...currentTeam.roster]); 
            //onNotify((prevRoster) => [...prevRoster, player]); // Notify App about Team 1's updated roster
        // }
            nextTurn();
            console.log('current Team is ' + draftOrder[currentPick].name);
            setCurrentTeam(draftOrder[currentPick]); // Update current team
            onPick(player);
    //    }
    };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snake Draft</Text>
      <Text style={styles.currentTeam}>
        {currentTeam.name}'s Turn - Round {currentRound}
         Player's left: {players.length}
      </Text>

      {/* Player List */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PlayerRow player={item} onDraft={() => {
            console.log("Current User is " + currentUser.teamName);
            handleDraft(item);}} />
        )}
      />

      {/* Team Rosters */}
      
{/*         <View style={styles.teamRosters}>
            {teams.map((team) => (
            <TeamRoster key={team.id} team={team} />
            ))}
        </View> */}

      {/* View My Team Button */}
      <TouchableOpacity onPress={() => navigation.navigate("MainTabs", { screen: "My Team" })}>
        <Text style={styles.viewMyTeam}>View My Team</Text>
      </TouchableOpacity>

              {/* Drafting Turn Check */}
        <Modal visible={!!draftTurn} transparent animationType="slide">
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalText}>User Team is: {currentUser?.teamName}</Text>
                <Text style={styles.modalText}>Draft Turn is for: {currentTeam?.name}</Text>
                <Text style={styles.modalText}>It's not your turn</Text>

                <View style={styles.modalbutton}>
                        <TouchableOpacity style={styles.buttonStyle} title="OK" onPress={() => setdraftTurn(false)}>
                          <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>

                </View>
            </View>
            </View>
        </Modal>




    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  currentTeam: { color: "#fff", fontSize: 18, marginBottom: 10, textAlign: "center" },
  teamRosters: { marginTop: 20, maxHeight : "100" },
  viewMyTeam: { color: "#4CAF50", fontSize: 16, textAlign: "center", marginTop: 20, textDecorationLine: "underline" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#1E1E1E", padding: 20, borderColor:"#4CAF50", borderRadius: 10, borderWidth: 1,  alignItems: "center" },
  modalText: { color:"#fff",fontSize: 18, fontWeight: "bold", marginBottom: 10, paddingBottom:10 },
  modalbutton: { backgroundColor: "1e1e1e", flexDirection: "row", justifyContent: "space-between", width: "40%" },
  buttonStyle: { backgroundColor: "#4CAF50", paddingVertical: 5, paddingHorizontal: 15, borderRadius: 4 },
  buttonText: {color: "#fff"},
});

export default DraftScreen;
