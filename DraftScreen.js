import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import PlayerRow from "./PlayerRow";
import TeamRoster from "./TeamRoster";
import playerData from "./assets/players.json";



const DraftScreen = ({ playerList, onPick, onNotify, navigation, users, updateUserRoster }) => {

    const [players, setPlayers] = useState(playerList);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

    const teams = users.map((user) => ({
        id: user.id,
        name: user.teamName,
        roster: user.roster,
      }));


    let draftOrder = [...teams]; // Start in normal order 
    let currentRound = 1;
    let currentPick = 0;

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
        // console.log(currentTeam.name);

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

        //setPlayers([...playerList]); // Update available players
        // if (currentTeam.id === 1) {
                //onNotify([...currentTeam.roster]); 
            //onNotify((prevRoster) => [...prevRoster, player]); // Notify App about Team 1's updated roster
        // }
            nextTurn();
            setCurrentTeam(draftOrder[currentPick]); // Update current team
            onPick(player);
    //    }
    };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snake Draft</Text>
      <Text style={styles.currentTeam}>
        {draftOrder[currentPick]?.name}'s Turn - Round {currentRound}
      </Text>

      {/* Player List */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PlayerRow player={item} onDraft={() => handleDraft(item)} />
        )}
      />

      {/* Team Rosters */}
      
        <View style={styles.teamRosters}>
            {teams.map((team) => (
            <TeamRoster key={team.id} team={team} />
            ))}
        </View>

      {/* View My Team Button */}
      <TouchableOpacity onPress={() => navigation.navigate("My Team")}>
        <Text style={styles.viewMyTeam}>View My Team</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  currentTeam: { color: "#fff", fontSize: 18, marginBottom: 10, textAlign: "center" },
  teamRosters: { marginTop: 20, maxHeight : "100" },
  viewMyTeam: { color: "#4CAF50", fontSize: 16, textAlign: "center", marginTop: 20, textDecorationLine: "underline" },
});

export default DraftScreen;
