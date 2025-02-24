// leagueCardStyles.js

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  cardContainer: {
    // Overall card layout
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    
    // Shadows (iOS + Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // for Android
    
    // Background color (in case gradient not used, or fallback)
    backgroundColor: '#fff',
    // So corners stay rounded if you use a child gradient
    overflow: 'hidden',
  },
  
  // If you're using react-native-linear-gradient,
  // apply these styles to the <LinearGradient> as a child of cardContainer
  gradientBackground: {
    // Fills entire card area
    flex: 1,
    padding: 16, 
    justifyContent: 'center',
  },

  leagueName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#fff', // if your gradient is dark; otherwise adjust as needed
  },

  dottedDivider: {
    // A dotted horizontal line
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)', // or any color you want
    borderStyle: 'dotted',
    marginVertical: 8,
  },

  teamName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff', // match or contrast with your gradient
  },
});
