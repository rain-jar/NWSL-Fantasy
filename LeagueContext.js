// LeagueContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "./supabaseClient";
import { subscribeToLeaguePlayerUpdates } from "./supabaseListeners";
import { subscribeToLeaguePlayerInserts } from "./supabaseListeners";
import { subscribeToLeagueRosterUpdates } from "./supabaseListeners";
import { subscribeToLeagueRosterInserts } from "./supabaseListeners";
import {subscribeToUserInserts} from "./supabaseListeners";


const LeagueContext = createContext(null);

export function LeagueProvider({ leagueId, userId, children }) {
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [leagueParticipants, setLeagueParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const fetchUserInitial = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
      if (!error && data) {
        setUsers(data);
        console.log("Fetching User data ", data);
      }
    };
    fetchUserInitial();
    const unsubscribeUserInserts = subscribeToUserInserts(setUsers);
    return () => {
      unsubscribeUserInserts();
    }
  },[])

  useEffect(() => {
    if (!leagueId) return;

    const fetchInitial = async () => {
        const { data, error } = await supabase
          .from("league_players")
          .select("*")
          .eq("league_id", leagueId)
          .eq("onroster", false);
        if (!error && data) {
          setAvailablePlayers(data);
        }
      };

      const fetchRosterInitial = async () => {
        const { data, error } = await supabase
          .from("league_rosters")
          .select("*")
          .eq("league_id", leagueId)
        if (!error && data) {
          console.log("League Participants in LeagueContext fetch ", data);
          setLeagueParticipants(data);
        }
      };

    
    fetchInitial();
    fetchRosterInitial();
    const unsubscribeUpdates = subscribeToLeaguePlayerUpdates(setAvailablePlayers, leagueId);
    const unsubscribeInserts = subscribeToLeaguePlayerInserts(setAvailablePlayers);
    const unsubscribeRosterUpdates = subscribeToLeagueRosterUpdates(setLeagueParticipants, leagueId);
    const unsubscribeRosterInserts = subscribeToLeagueRosterInserts(setLeagueParticipants, leagueId);

    supabase.getChannels().forEach(channel => console.log("Active channel:", channel));

  
    return () => {
      // Clean up both subscriptions
      unsubscribeUpdates();
      unsubscribeInserts();
      unsubscribeRosterUpdates();
      unsubscribeRosterInserts();
    };
  }, [leagueId]);


  console.log("LeagueProvider value:", {
    availablePlayers,
    setAvailablePlayers,
    leagueId,
    userId,
    leagueParticipants,
    setLeagueParticipants
  });

  return (
    <LeagueContext.Provider value={{ availablePlayers, setAvailablePlayers, leagueId, leagueParticipants, setLeagueParticipants, userId, users, setUsers}}>
      {children}
    </LeagueContext.Provider>
  );
}

// Helper hook to read from context
export function useLeague() {
  return useContext(LeagueContext);
}
