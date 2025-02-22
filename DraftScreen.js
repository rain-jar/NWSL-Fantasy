import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import supabase from "./supabaseClient";
import PlayerRow from "./PlayerRow";
import TeamRoster from "./TeamRoster";
import playerData from "./assets/players.json";
import { subscribeToDraftUpdates } from "./supabaseListeners";
import { subscribeToLeaguePlayerDraftUpdates } from "./supabaseListeners";
import { LeagueProvider, useLeague } from "./LeagueContext";





/*
let currentRound = 1;
let currentPick = 0;
let draftOrder = []; // Initialize draft order
*/


const DraftScreen = ({ onPick, currentUser, users, navigation }) => {

    const { availablePlayers, setAvailablePlayers, leagueId } = useLeague();
    const { leagueParticipants, setLeagueParticipants} = useLeague();

    const [players, setPlayers] = useState([...availablePlayers]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [draftTurn, setdraftTurn] = useState(false);
    const [draftStateId, setDraftStateId] = useState(null);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentPick, setCurrentPick] = useState(0);
    const [draftOrder, setDraftOrder] = useState([users]);
    const [isDrafting, setIsDrafting] = useState(false); 
    const [playerStats, setPlayerStats] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [localAvailablePlayers, setlocalAvailablePlayers] = useState([...availablePlayers]);
    const [loading, setLoading] = useState(false); // Add loading state
    const [listenerupdate, setlistenerupdate] = useState(false);
    

    useEffect(() => {
        const unsubscribe = subscribeToDraftUpdates(setCurrentRound, setCurrentPick, setDraftOrder);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true); 
            await fetchDraftState();
            await fetchPlayerStats();
            console.log("DraftScreen fetches draft state - currentPick:", currentPick, " currentRound:", currentRound);
            setLoading(false);
            console.log(" Loading inside Initial fetches", loading);
        };
    
        fetchInitialData();
    }, [leagueId, leagueParticipants]);


  // Whenever availablePlayers (from context) changes, merge them with local playerStats to build the displayable array
  useEffect(() => {
    if (!loading && availablePlayers?.length > 0) {
        console.log("After fetching ", availablePlayers);
      const mergedList = availablePlayers.map((player) => {
        const statsMatch = playerStats.find((m) => m.id === player.player_id) || {};
        return {
          ...player,
          name: statsMatch.name || "",
          position: statsMatch.position || "",
        };
      });
      setPlayers(mergedList);
    }
  }, [availablePlayers, playerStats, loading]);
/*
    useEffect(() => {
        const updatePlayerList = async() => {
            console.log("Going into localAvailablePlayer state update");
           // if (!loading) return;
            console.log("Fetch merged player list since local available players is updated");
            await fetchPlayers();
            setLoading(false);
            console.log("player list update after draft ", players);
        };
        updatePlayerList();
    }, [localAvailablePlayers]);
*/
    
    const teams = leagueParticipants.map((user) => ({
        id: user.user_id,
        name: user.team_name,
        roster: user.roster,
      }));

      
    // Fetch draft state from Supabase
    const fetchDraftState = async () => {
      try{
        console.log("League Id is ", leagueId);
        console.log("loading in Draft State is ", loading);
        const { data, error } = await supabase.from("draft_state")
        .select("*")
        .eq("id", leagueId);
        console.log("Draft State data fetched before update ", data);
    
        if (error || data.length == 0) {
         console.error("Error fetching draft state:", error);
         const { data: newData, error: insertError } = await supabase
                .from("draft_state")
                .insert([{ id: leagueId, current_round: 1, current_pick: 0, draft_order: leagueParticipants }])
                .select()
                .single();

            if (insertError) {
                console.error("Error initializing draft state:", insertError);
                return;
            }
            setDraftStateId(newData.id);
            setCurrentRound(newData.current_round);
            setCurrentPick(newData.current_pick);
            setDraftOrder(newData.draft_order);
            console.log("Draft State is fetched for the first time for League ",leagueId);
            console.log("Initial Draft is : Current Pick: ",newData.currentPick, " CurrentRound: ", newData.currentRound);
            console.log("Whereas Initial App Draft  is : Current Pick: ",currentPick, " CurrentRound: ", currentRound);

        } else {
        console.log("Draft Fetch is successful ");
        setDraftStateId(data[0].id);
        setCurrentRound(data[0].current_round);
        setCurrentPick(data[0].current_pick);
        setDraftOrder(data[0].draft_order); // Default to teams if empty
        console.log("Fetch State on App.tsx render ", data, "Current pick: ", data.current_pick, " Current Round: ", data.current_round)
        }
      } catch (err) {
        console.log("🔥 Unexpected fetch error:", err);
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
          console.log("Players Base data is fetched in DraftScreen but only once",data );
        }
      };
 /*   
    const fetchPlayers = async () => {
        try{
          let playerListFull
        //  console.log("Collecting player names and positions: ", selectedStatsType);
          console.log("Calling Fetch Players ");
          playerListFull = localAvailablePlayers.map((player) => {
            const seasonMerge = playerStats.find((m) => m.id === player.player_id) || {};
            return {
              ...player,
              name : seasonMerge.name || "",
              position : seasonMerge.position || "",
            };
          });
          console.log("This is the merged data now ", playerListFull);
          setPlayers(playerListFull);
        } catch (err) {
            console.error("🔥 Unexpected fetch error:", err);
          }
      };
      */

/*
    if(currentRound === 1 && currentPick === 0){
        draftOrder = [...teams]; // Set it once and for all 
    }
        */


  //  console.log("Local Available Players ", localAvailablePlayers);
    console.log("Players List with positions and names ", players);
    console.log("Available Players ", availablePlayers);
    console.log("League participants ", leagueParticipants);
    console.log("Draft Order team ", draftOrder[currentPick].team_name);
    console.log("Roster is ", draftOrder[currentPick]);
    console.log("Loading ", loading);


// Position Constraints

    const maxPlayersPerTeam = 11;
    const minPositions = { FW: 1, MF: 3, DF: 3, GK: 1 };
    const maxPositions = { FW: 4, MF: 5, DF: 5, GK: 1 };


    const currentTeam = draftOrder[currentPick];
    const test = leagueParticipants.find((participant) => participant.team_name == draftOrder[currentPick].team_name);

    console.log ("Current Team in DraftScreen is ", currentTeam);
    console.log("Current Test is ", test);


// Helper Functions
    const nextTurn = async() => {
        console.log("currentPick: ",currentPick," currentRound: ",currentRound)
        let newPick = currentPick;
        let newRound = currentRound;
        let newDraftOrder = [...draftOrder];

        if (newPick < newDraftOrder.length - 1) {
            newPick++;
          } else {
            newRound++;
            newDraftOrder.reverse(); // Reverse for snake draft
            newPick = 0;
          }
        
          // Update local state
          setCurrentPick(newPick);
          setCurrentRound(newRound);
          setDraftOrder(newDraftOrder);
          console.log("currentPick: ",newPick," currentRound: ",newRound)
        
          if (!draftStateId) return;

          // Save draft state to Supabase
          const { error } = await supabase
            .from("draft_state")
            .update({
              current_round: newRound,
              current_pick: newPick,
              draft_order: newDraftOrder
            })
            .eq("id", draftStateId); // Replace with actual draft state row ID
        
          if (error) {
            console.error("Error updating draft state:", error);
          }

/*
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
        */
    }

    const isValidPick = (team, player) => {
        const positionCount = {
            FW: team.roster.filter(p => p.position.includes("FW")).length,
            MF: team.roster.filter(p => p.position.includes("MF")).length,
            DF: team.roster.filter(p => p.position.includes("DF")).length,
            GK: team.roster.filter(p => p.position.includes("GK")).length
        };

        // Position constraints
        if (player.position.includes("GK") && positionCount.GK >= maxPositions.GK) {console.log("Already has a GK"); return false;}
        if (team.roster.length >= maxPlayersPerTeam) {console.log("No Spots Left"); return false;}

        if (team.roster.length < maxPlayersPerTeam) {
            const playerPositions = player.position.split("-");
            const canFit = playerPositions.some(pos => positionCount[pos] < maxPositions[pos]);
            if (!canFit) {console.log("Player Position already filled"); return false;}
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

    const handleDraft = async(player) => {
        if (isDrafting) return; // Prevent duplicate drafts
        setIsDrafting(true);

        console.log("Drafting team is "+ draftOrder[currentPick].team_name);

        if (currentUser.id != draftOrder[currentPick].user_id){
            console.log ("It's not the current user's turn");
            setdraftTurn(true);
            setIsDrafting(false);
            return false;
        }
        const team = teams.find(t => t.id === draftOrder[currentPick].user_id);

        if (!team || player.onroster || !isValidPick(team, player)) {
            console.log(`Invalid pick: ${player.name}`);
            setIsDrafting(false);
            return false;
        }

        let assignedPosition = player.position;
        if (player.position.includes("-")) {
            const possiblePositions = player.position.split("-");
            assignedPosition = possiblePositions.find(pos => team.roster.filter(p => p.position.includes(pos)).length < maxPositions[pos]) || possiblePositions[0];
        }


    //    const success = draftPlayer(currentTeam.id, player, playerList, teams);
    //    if (success) {

                // **Fetch current roster**
            
            const currentRoster = leagueParticipants.find((participant) => participant.team_name == draftOrder[currentPick].team_name).roster;

              // ** Append new player**
            const updatedRoster = [...currentRoster, player];

            const { error } = await supabase
            .from("league_rosters")
            .update({ roster: updatedRoster })
            .eq("league_id", draftOrder[currentPick].league_id)
            .eq("user_id",draftOrder[currentPick].user_id);
            console.log(`${draftOrder[currentPick].team_name} drafted ${player.name}`);

            if (error) {
                console.error("Error updating roster:", error);
                setIsDrafting(false);
                alert("Failed to update roster. Try again.");
                return;
            }else{
                console.log("Roster updated successfully in Supabase!");
            }
            
            // Update Player Status in availablePlayers in Supabase
            const { error: playerError } = await supabase
            .from("league_players")
            .update({ onroster: true })
            .eq("player_id", player.player_id)
            .eq("league_id", draftOrder[currentPick].league_id);
            console.log("Player: "+player.name+"'s onRoster status is true in the players table in Supabase")

            if (playerError) {
            console.error("Error updating player from available players:", playerError);
            setIsDrafting(false);
            return;
            }

            //updateUserRoster(draftOrder[currentPick].id, (prevRoster) => [...prevRoster, { ...player, assignedPosition }]);
            //setPlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name));
            //setAvailablePlayers((prevPlayers) => prevPlayers.filter((p) => p.name !== player.name));
            console.log(`${draftOrder[currentPick].team_name} drafted ${player.name} as ${assignedPosition}`);


        //setPlayers([...playerList]); // Update available players
        // if (currentTeam.id === 1) {
                //onNotify([...currentTeam.roster]); 
            //onNotify((prevRoster) => [...prevRoster, player]); // Notify App about Team 1's updated roster
        // }
            nextTurn();
            console.log('current Team is ' + draftOrder[currentPick].team_name);
           // setCurrentTeam(draftOrder[currentPick]); // Update current team
         //   onPick(player);
            setIsDrafting(false);
    //    }
    };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snake Draft</Text>
      <Text style={styles.currentTeam}>
        {draftOrder[currentPick].team_name}'s Turn - Round {currentRound}
         Player's left: {players.length}
      </Text>

      {/* Player List */}
      <FlatList
        key = {players.length}
        data={players}
        keyExtractor={(item) => item.player_id}
        renderItem={({ item }) => (
          <PlayerRow player={item} isDrafting={isDrafting} onDraft={() => {
            console.log("Current User is " + currentUser.user_name);
            console.log("Player Name is ", item.name);
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
                <Text style={styles.modalText}>User Team is: {currentUser?.team_name}</Text>
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
