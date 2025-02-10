import supabase from "./supabaseAdminClient.mjs";
import { readFileSync } from "fs";

const playerData = JSON.parse(readFileSync(new URL("./assets/Matchday1Stats.json", import.meta.url), "utf8"));

const uploadPlayers = async () => {
  const { data, error } = await supabase
    .from("players")
    .insert(playerData);

  if (error) {
    console.error("Error uploading players:", error);
  } else {
    console.log("Players uploaded successfully:", data);
  }
};

// Call this function **once** to upload your player data
uploadPlayers();
