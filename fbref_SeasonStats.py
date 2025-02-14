import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
import time


### This script scrapes through each team's page and fetches Season Long Player Data.
### It also fetches the image URLs from the profile pages of each of the players listed on the team page. 

# Sample team URL
#team_url = "https://fbref.com/en/squads/e442aad0/Washington-Spirit-Stats"

# Dictionary to store player stats
players_data = {}
clean_Sheet = 0
goalsAgainst = 0

# Function to extract player stats from a table
def extract_table_data(soup, team, table_id, stat_fields, is_goalkeeping):
    print("inside extract function")
    global clean_Sheet, goalsAgainst

    table_header = soup.find("span", {"id": lambda x: x and table_id in x})
    print(table_header)
        # Get the parent div that contains this span
    if table_header:
        table_div = table_header.find_parent("div")
    else:
        table_div = None  # Handle case where span is not found

    if (table_id=="stats_standard"):
        table = table_div.find_next("table", {"id": lambda x: x and "standard" in x})
    else:
        table = table_div.find_next("table", {"id": lambda x: x and "keeper" in x})

    if table:
        tbody = table.find("tbody")
        rows = tbody.find_all("tr")
        rowcounter = 0
        for row in rows:
            player_cell = row.find("th", {"data-stat": "player"})
            if player_cell:
                player_name = player_cell.text.strip()
                player_url = "https://fbref.com" + player_cell.find("a")["href"] if player_cell.find("a") else ""

                # Initialize player data if not already in dictionary
                if player_name not in players_data:
                    players_data[player_name] = {
                        "name": player_name,
                        "team": team,
                        "PositionTemp": "",
                        "Minutes": 0,
                        "goals": 0,
                        "assists": 0,
                        "PKMissed": 0,
                        "Goals Against": 0,
                        "Saves": 0,
                        "Clean Sheet": 0,
                        "Yellow Cards": 0,
                        "Red Cards": 0,
                        "URL": player_url,
                        "ImgURL": "assets/placeholder.png",
                    }


                pk_scored = 0
                pk_attempted = 0

                # Extract stats from table
                for stat in stat_fields:
                    stat_cell = row.find("td", {"data-stat": stat})
                    if stat_cell:
                        value = stat_cell.text.strip()
                        if is_goalkeeping and stat in ["gk_clean_sheets"]:
                            players_data[player_name]["Clean Sheet"] = int(value) if value and value.isdigit() else 0
                            clean_Sheet = clean_Sheet + int(value) if value and value.isdigit() else 0
                            print (f"This is {player_name} and her CS is :{value}")
                        else:
                            if is_goalkeeping and stat in ["gk_goals_against"]:
                                players_data[player_name]["Goals Against"] = int(value) if value and value.isdigit() else 0
                                goalsAgainst = goalsAgainst + int(value) if value and value.isdigit() else 0
                                print(f"This is a {player_name} and her GA is : {value}")
                            elif stat=="pens_made":
                                pk_scored = int(value) if value and value.isdigit() else (0 if not value else value)
                            elif stat=="pens_att":
                                pk_attempted = int(value) if value and value.isdigit() else (0 if not value else value)
                            else:
                                players_data[player_name][stat_fields[stat]] = int(value) if value and value.isdigit() else (0 if not value else value)
                players_data[player_name]["PKMissed"] = pk_attempted - pk_scored
                rowcounter = rowcounter+1
        print(rowcounter)
        if not is_goalkeeping:
            print(f"For {team}, CS: {clean_Sheet} and GA: {goalsAgainst}")
            for player_name, player_info in players_data.items():
                GKCheck = player_info.get("PositionTemp", "")
                if (GKCheck != "GK"):
                    players_data[player_name]["Clean Sheet"] = clean_Sheet
                    players_data[player_name]["Goals Against"] = goalsAgainst
            clean_Sheet = 0
            goalsAgainst = 0
        else:
            print(f"For team {team}, CS: {clean_Sheet} and GA : {goalsAgainst}")
    else:
        print(f"Table is not found for {team}")

# Extract data from "Standard Stats" table
standard_stats_fields = {
    "position": "PositionTemp",
    "minutes": "Minutes",
    "goals": "goals",
    "assists": "assists",
    "pens_made": "PK",
    "pens_att": "PKatt",
    "cards_yellow": "Yellow Cards",
    "cards_red": "Red Cards",
}
#extract_table_data("stats_standard", standard_stats_fields)

# Extract data from "Goalkeeping" table
goalkeeping_stats_fields = {
    "gk_goals_against": "Goals Against",
    "gk_saves": "Saves",
    "gk_clean_sheets": "Clean Sheet",
}
#extract_table_data("stats_keeper", goalkeeping_stats_fields, is_goalkeeping=True)

# Save data to JSON
"""
output_file = "season_player_stats.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(players_data, f, indent=4)

df = pd.DataFrame(players_data.values())
print(df.head())  # Shows first few rows in terminal
#df.to_csv("season_player_stats.csv", index=False)  # Saves data
"""

def fetch_player_images():
    count = 0
    for player_name, player_info in players_data.items():
       # if count>=2:
       #     break

        profile_url = player_info.get("URL", "")
        print("profile_url")
        if not profile_url:
            continue  # Skip if no profile URL
        
        response = requests.get(profile_url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            print("before locating image")
            # Locate the image inside the profile page
            img_tag = soup.find("img", {"alt": lambda x: x and "headshot" in x})  # FBRef uses "headshot" class for player images
            print(img_tag)
            if img_tag and "src" in img_tag.attrs:
                image_url = img_tag["src"]
                if not image_url.startswith("http"):
                    image_url = "https://fbref.com" + image_url  # Ensure full URL
                
                players_data[player_name]["ImgURL"] = image_url
                print("Fetched image for ", player_name)
            else:
                # Assign placeholder image if no image found
                players_data[player_name]["ImgURL"] = "assets/placeholder.jpg"
                print("Placeholder assigned for ", player_name)
        else:
            print(f"⚠️ Could not fetch {player_name}'s profile page")
        count = count + 1
        print("No. of Players fetched : ", count)

# Run the scraping function
#fetch_player_images()


team_links = {
    "Spirit" : "https://fbref.com/en/squads/e442aad0/Washington-Spirit-Stats",
 #   "Pride"  : "https://fbref.com/en/squads/2a6178ac/Orlando-Pride-Stats",
 #   "Gotham" : "https://fbref.com/en/squads/8e306dc6/Gotham-FC-Stats",
}

# Loop through all teams and extract player data

for key, values in team_links.items():
    print(f"📊 Scraping {key}...")

        # Headers to mimic a real browser request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # Request the page
    print(f"Requesting the page for {key}")
    response = requests.get(values, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    print(response)
    extract_table_data(soup, key, "stats_keeper", goalkeeping_stats_fields, is_goalkeeping=True)
    extract_table_data(soup, key, "stats_standard", standard_stats_fields, is_goalkeeping=False)
    print(f"Season stats for {key} are fetched")
    time.sleep(5)  # Respectful delay to avoid rate limiting



output_file = "season_player_stats.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(players_data, f, indent=4, ensure_ascii=False)

df = pd.DataFrame(players_data.values())
#print(df.head())  # Shows first few rows in terminal
df.to_csv("season_player_stats.csv", index=False)  # Saves data