import supabase from "./supabaseClient.js";

const testConnection = async () => {
console.log("supabaseTest");
  const { data, error } = await supabase.from("leagues").select("*");
  console.log("Test Fetch:", data, error);
};

testConnection();