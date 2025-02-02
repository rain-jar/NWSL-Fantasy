import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TeamRoster = ({ team }) => (
  <View style={styles.teamRoster}>
    <Text style={styles.teamName}>{team.name}</Text>
    {team.roster.map((player, index) => (
      <Text key={index} style={styles.rosterPlayer}>
        {/* {player.name}-{player.position} */}
        {player.name ? player.name : ""} {player.position ? `- ${player.position}` : ""}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  teamRoster: { marginBottom: 15 },
  teamName: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  rosterPlayer: { color: "#bbb", fontSize: 16 }
});

export default TeamRoster;
