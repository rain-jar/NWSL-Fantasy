import pandas as pd
import os

# List of CSV files to combine (Add all team files here)

# Define position mappings
position_mapping = {
    "FW": ["FW", "LW", "RW"],
    "MF": ["AM", "DM", "CM","LM","RM","MF"],
    "DF": ["LB", "RB", "CB", "DF"],
    "GK": ["GK"]
}

# Function to map PositionTemp to Position
def map_position(position_temp):
    positions = set()  # Use a set to avoid duplicates
    for key, values in position_mapping.items():
        if any(pos in position_temp for pos in values):  # Check if any mapped position exists
            positions.add(key)
    return "-".join(sorted(positions))  # Join multiple positions correctly


# Define the column headers to maintain consistency
columns = ["name", "team", "PositionTemp", "Minutes", "goals", "assists",
           "PKMissed", "Goals Against", "Saves", "Clean Sheet", "Yellow Cards", 
           "Red Cards", "URL", "ImgURL"]

# Read and combine CSV files
df = pd.read_csv("season_player_stats.csv")

# Ensure consistent column ordering
combined_df = df[columns]

combined_df["position"] = combined_df["PositionTemp"].apply(map_position)


""" # Save the consolidated file
output_file = "Matchday1Stats.csv"
combined_df.to_csv(output_file, index=False) """

#print(f"✅ SeasonStats.csv successfully created with {len(combined_df)} rows!")

# Fantasy Scoring Rules
def calculate_fantasy_points(row):
    points = 0
    
    # 1. Playing time points
    #print(type(row["Minutes"]))
    minutes = int(row["Minutes"].replace(",", "")) if row["Minutes"] else 0
    if minutes >= 60:
        points += 2
    elif minutes > 0:
        points += 1

    # 2. Goals scored based on position
    goals = row["goals"]
    if "GK" in row["position"]:
        points += goals * 10
    elif "DF" in row["position"]:
        points += goals * 6
    elif "MF" in row["position"]:
        points += goals * 5
    elif "FW" in row["position"]:
        points += goals * 4

    # 3. Assists
    points += row["assists"] * 3

    # 4. Clean sheets
    if row["Clean Sheet"]:
        if "GK" in row["position"] or "DF" in row["position"]:
            points += 4
        elif "MF" in row["position"]:
            points += 1

    # 5. Saves (For goalkeepers)
    points += (row["Saves"] // 3) * 1  # Every 3 saves = 1 point

    # 6. Penalty Saves & Misses
    points += row["PKMissed"] * -2  # Penalty Miss = -2 points
    """points += row["Saves"] * 5"""  # Penalty Save = 5 points

    # 7. Goals Conceded (For goalkeepers & defenders)
    if "GK" in row["position"] or "DF" in row["position"]:
        points -= (row["Goals Against"] // 2) * 1  # Every 2 goals conceded = -1 point

    # 8. Cards & Own Goals
    points += row["Yellow Cards"] * -1
    points += row["Red Cards"] * -3
    """points += row["Goals Against"] * -2""" # Own Goal = -2 points

    return points

# Apply Fantasy Scoring function
combined_df["FantasyPoints"] = combined_df.apply(calculate_fantasy_points, axis=1)

output_file = "SeasonStatsProcessed.csv"
combined_df.to_csv(output_file, index=False) 

# Convert DataFrame to JSON format
json_output = combined_df.to_json(orient="records", indent=4)

# Save as JSON file
json_file_path = "SeasonStatsProcessed.json"
with open(json_file_path, "w") as json_file:
    json_file.write(json_output)

print(f"✅ SeasonStats successfully converted to JSON: {json_file_path}")

