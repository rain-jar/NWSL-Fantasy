import supabase from "./supabaseClient";

// Listener for Users & Players (Used in App.tsx)
export const subscribeToUserAndPlayerUpdates = (setUsers, setAvailablePlayers) => {
    console.log("Setting up real-time listeners...");
  
    const userSubscription = supabase
      .channel("users_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users" }, async(payload) => {
    
        // **Force state update using functional setState**
        setUsers((prevUsers) => {
          const userExists = prevUsers.some((user) => user.id === payload.new.id);

          if (userExists) {
            // Update existing user
            return prevUsers.map((user) =>
              user.id === payload.new.id ? { ...user, ...payload.new } : user
            );
          } else {
            // Add new user to the list
            console.log("🆕 Adding new user:", JSON.stringify(payload.new));
            return [...prevUsers, payload.new]; // Append new user
          }
        });   
      })

      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" }, (payload) => {

        setUsers((prevUsers) => {
            console.log("👥 Current users before update:", JSON.stringify(prevUsers));
            console.log("🔍 Incoming payload:", JSON.stringify(payload.new));
          
            const userExists = prevUsers.some((user) => user.id === payload.new.id);
          
            if (userExists) {
              // **Check if the roster has changed**
              const existingUser = prevUsers.find((user) => user.id === payload.new.id);
              console.log("Existing user roster :", existingUser.roster);

              if (JSON.stringify(existingUser.roster) !== JSON.stringify(payload.new.roster)) {
                    console.log("🔄 Updating roster for user:", payload.new.id);

                    const oldRoster = existingUser.roster || [];
                    const newRoster = payload.new.roster || [];
                
                    // **Find drafted or added players (added to roster)**
                    const draftedPlayers = newRoster.filter((player) =>
                    !oldRoster.some((p) => p.name === player.name)
                    );

                    // **Find dropped players (removed from roster)**
                    const droppedPlayers = oldRoster.filter((player) =>
                        !newRoster.some((p) => p.name === player.name)
                    );                   

                    console.log("✅ Drafted or Added players:", JSON.stringify(draftedPlayers));
                    console.log("❌ Dropped players:", JSON.stringify(droppedPlayers));


                    setAvailablePlayers((prevPlayers) => {
                        let updatedPlayers = [...prevPlayers];
                
                        // Remove drafted players
                        draftedPlayers.forEach((player) => {
                        updatedPlayers = updatedPlayers.filter((p) => p.name !== player.name);
                        });    
                        
                        // Add dropped players only if they are not already in the list
                        droppedPlayers.forEach((player) => {
                            if (!updatedPlayers.some((p) => p.name === player.name)) {
                            console.log("Pushing :",player.name);
                            updatedPlayers.push(player);
                            }
                        });

                        console.log("Updated Players : ", updatedPlayers);
                        return updatedPlayers;
                    });

                
                    console.log("🔄 Updating roster for user:", payload.new.id);
                    return prevUsers.map((user) =>
                    user.id === payload.new.id ? { ...user, roster: payload.new.roster } : user);
                }

            } else {
              // **If user does not exist, add them**
              console.log("🆕 Adding new user:", JSON.stringify(payload.new));
              return [...prevUsers, payload.new];
            }
            console.log("User roster updated:", payload.new);
        });

      })

      
      .subscribe();
  
    const playerSubscription = supabase
      .channel("players_changes")
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "players" }, async(payload) => {
        console.log("🔍 Incoming payload:", JSON.stringify(payload.old));
        console.log("Player:", payload.id," is already removed while updating team")

      })


      .on("postgres_changes", { event: "INSERT", schema: "public", table: "players" }, (payload) => {

        setAvailablePlayers((prevPlayers) => {  
            console.log("✅ Adding dropped player back:", payload.new.name);
            if (!prevPlayers.some((p) => p.name === payload.new.name)) {
                console.log("Appending ", payload.new.name);
                return [...prevPlayers, payload.new]; // Append only if not present
            }
            return prevPlayers;
          });
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(userSubscription);
      supabase.removeChannel(playerSubscription);
    };
  };



// Listener for Draft (Used in DraftScreen.js)
export const subscribeToDraftUpdates = (setCurrentRound, setCurrentPick, setDraftOrder) => {
    console.log("Setting up draft state real-time listener...");
  
    const draftSubscription = supabase
      .channel("draft_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "draft_state" }, (payload) => {
        console.log("Draft state updated:", payload.new);
        setCurrentRound(payload.new.current_round);
        setCurrentPick(payload.new.current_pick);
        setDraftOrder(payload.new.draft_order);        
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(draftSubscription);
    };
  };
