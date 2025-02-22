import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PlayerRow = ({ player, isDrafting, onDraft }) => {
  //console.log("in Player Row ");
  //console.log("Player Name is ", player.name);
  

  return (
    <View style={styles.playerRow}>
    <Text style={styles.playerText}>
      {player.name} ({player.position})
    </Text>
    <TouchableOpacity onPress={() => onDraft(player)} disabled={isDrafting} style={isDrafting ? styles.disabledButton : styles.draftButton}>
      <Text style={styles.draftButtonText}>Draft</Text>
    </TouchableOpacity>
  </View> 
  );
  
}


const styles = StyleSheet.create({
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8
  },
  playerText: { color: "#fff", fontSize: 16 },
  disabledButton: { backgroundColor: "#999", padding: 10, borderRadius: 8 },
  draftButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  draftButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" }
});

export default PlayerRow;
