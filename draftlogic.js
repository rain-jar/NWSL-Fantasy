const teams = [
    { id: 1, name: "Team 1", roster: [] },
    { id: 2, name: "Team 2", roster: [] },
    { id: 3, name: "Team 3", roster: [] },
    { id: 4, name: "Team 4", roster: [] }
];
  
const maxPlayersPerTeam = 5;

// List of all available players (this will come from your JSON later)
let availablePlayers = []; // To be populated with real player data

let currentRound = 1;
let currentPick = 0;
let draftOrder = [...teams]; // Start in normal order

function nextTurn() {
    if (currentPick < draftOrder.length - 1) {
        currentPick++;
    } else {
        // End of round: Reverse order for next round
        currentRound++;
        draftOrder.reverse();
        currentPick = 0;
    }
}


function isValidPick(team, player) {
    const positionCount = {
      FW: team.roster.filter(p => p.position.includes("FW")).length,
      MF: team.roster.filter(p => p.position.includes("MF")).length,
      DF: team.roster.filter(p => p.position.includes("DF")).length,
      GK: team.roster.filter(p => p.position.includes("GK")).length,
    };
  
    // Cannot pick more than 1 GK
    if (player.position.includes("GK") && positionCount.GK >= 1) {
      console.log(`${team.name} already has a Goalkeeper.`);
      return false;
    }
  
    // Cannot pick more than 5 total players
    if (team.roster.length >= maxPlayersPerTeam) {
      console.log(`${team.name} already has 5 players.`);
      return false;
    }
  
    // Ensure primary player roles are filled before picking a duplicate
    if (team.roster.length < 4) {
      const playerPositions = player.position.split("-");
  
      if (playerPositions.includes("FW") && positionCount.FW >= 1 && playerPositions.length === 1) return false;
      if (playerPositions.includes("MF") && positionCount.MF >= 1 && playerPositions.length === 1) return false;
      if (playerPositions.includes("DF") && positionCount.DF >= 1 && playerPositions.length === 1) return false;
  
      // If the player has multiple positions, allow them to fill an open one
      if (playerPositions.length > 1) {
        const canFit = playerPositions.some(pos => positionCount[pos] === 0);
        if (!canFit) return false;
      }
    }
  
    return true;
  }


  function draftPlayer(teamId, player) {
    const team = teams.find(t => t.id === teamId);
  
    if (!team) {
      console.log("Invalid team.");
      return false;
    }
  
    if (!availablePlayers.includes(player)) {
      console.log(`${player.name} has already been drafted.`);
      return false;
    }
  
    if (!isValidPick(team, player)) {
      console.log(`Invalid pick: ${player.name} (${player.position})`);
      return false;
    }
  
    // If the player has multiple positions, assign them to an available slot
    let assignedPosition = player.position;
    if (player.position.includes("-")) {
      const possiblePositions = player.position.split("-");
      assignedPosition = possiblePositions.find(pos => team.roster.every(p => !p.position.includes(pos))) || possiblePositions[0];
    }
  
    // Add player with assigned position
    team.roster.push({ ...player, assignedPosition });
  
    // Remove from available pool
    availablePlayers = availablePlayers.filter(p => p !== player);
  
    console.log(`${team.name} drafted ${player.name} as a ${assignedPosition}`);
  
    // Move to next turn
    nextTurn();
  
    return true;
  }
  
  
availablePlayers = [
    { name: "Barbra Banda", position: "FW" },
    { name: "Trinity Rodman", position: "FW" },
    { name: "Debinha", position: "MF" },
    { name: "Rose Lavelle", position: "FW-MF" },
    { name: "Naomi Girma", position: "DF" },
    { name: "Becky Sauerbrunn", position: "MF-DF" },
    { name: "Alyssa Naeher", position: "GK" },
    { name: "Alex Morgan", position: "FW-MF"}
];
  
// Simulate draft picks
draftPlayer(1, availablePlayers[0]); // Team 1 picks Barbra Banda
draftPlayer(2, availablePlayers[0]); // Team 2 picks Trinity Rodman
draftPlayer(3, availablePlayers[0]); // Team 3 picks Debinha
draftPlayer(4, availablePlayers[0]); // Team 4 picks Rose Lavelle
draftPlayer(4, availablePlayers[0]); // Team 4 picks Naomi Girma (Snake order reversal)
draftPlayer(3, availablePlayers[0]); // Team 3 picks Becky Sauerbrunn
draftPlayer(2, availablePlayers[0]); // Team 2 picks Alyssa Naeher
draftPlayer(1, availablePlayers[0]); // Team 1 picks Alex Morgan


for(i=0;i<4;i++){
    console.log(teams[i].roster)
}
//console.log(teams);