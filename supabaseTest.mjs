import supabase from "./supabaseAdminClient.mjs";

const testConnection = async () => {
console.log("supabaseTest");
  const { data, error } = await supabase.from("players_base").select("*");
  console.log("Test Fetch:", data, error);
};

testConnection();