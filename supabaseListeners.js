import supabase from "./supabaseClient";

// Listener for Users & Players (Used in App.tsx)
export const subscribeToUserAndPlayerUpdates = () => {
    console.log("Setting up real-time listeners...");
  
    const userSubscription = supabase
      .channel("users_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users" }, (payload) => {
        console.log("New user added:", payload.new);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" }, (payload) => {
        console.log("User roster updated:", payload.new);
      })
      .subscribe();
  
    const playerSubscription = supabase
      .channel("players_changes")
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "players" }, (payload) => {
        console.log("Player removed from available list:", payload.old);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "players" }, (payload) => {
        console.log("Player added to available list:", payload.new);
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(userSubscription);
      supabase.removeChannel(playerSubscription);
    };
  };



// Listener for Draft (Used in DraftScreen.js)
export const subscribeToDraftUpdates = () => {
    console.log("Setting up draft state real-time listener...");
  
    const draftSubscription = supabase
      .channel("draft_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "draft_state" }, (payload) => {
        console.log("Draft state updated:", payload.new);
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(draftSubscription);
    };
  };
