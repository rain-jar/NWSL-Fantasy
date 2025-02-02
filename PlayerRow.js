import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PlayerRow = ({ player, onDraft }) => (
  <View style={styles.playerRow}>
    <Text style={styles.playerText}>
      {player.name} ({player.position})
    </Text>
    <TouchableOpacity style={styles.draftButton} onPress={() => onDraft(player)}>
      <Text style={styles.draftButtonText}>Draft</Text>
    </TouchableOpacity>
  </View>
);

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
  draftButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  draftButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" }
});

export default PlayerRow;
