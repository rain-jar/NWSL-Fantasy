import pandas as pd

# Load the Matchday1Stats CSV file
file_path = "Matchday1Stats.csv"  # Update with correct path if needed
df = pd.read_csv(file_path)

# Define position mappings
position_mapping = {
    "FW": ["FW", "LW", "RW"],
    "MF": ["AM", "DM", "CM", "MF"],
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

# Apply the mapping function
df["Position"] = df["PositionTemp"].apply(map_position)

# Save the updated CSV
output_file = "Matchday1Stats_Updated.csv"
df.to_csv(output_file, index=False)

print(f"✅ Position mapping completed! File saved as {output_file}")
