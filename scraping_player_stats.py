import requests
import json
from bs4 import BeautifulSoup
import re

# Example list of player links (use the ones you extracted)
player_links = [
    "https://fbref.com/en/players/7824185a/Barbra-Banda",
    "https://fbref.com/en/players/271c5edc/Anna-Moorhouse",
    "https://fbref.com/en/players/57ed42de/Ouleymata-Sarr",
    "https://fbref.com/en/players/74911ec6/Trinity-Rodman",
    "https://fbref.com/en/players/020eaa4d/Aubrey-Kingsbury",
    "https://fbref.com/en/players/8f146dff/Esther-Gonzalez",
    "https://fbref.com/en/players/be9f3298/Ann-Katrin-Berger",
    "https://fbref.com/en/players/b86badfa/Temwa-Chawinga",
    "https://fbref.com/en/players/2d2234cf/Adrianna-Franch",
    "https://fbref.com/en/players/9ced946b/Ashley-Sanchez",
    # Add more links from your extracted list
]

# List to store player data
player_data = []

# Scrape each player's stats
for link in player_links:
    response = requests.get(link)
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract player name
    name = soup.select_one('h1').text.strip()

    # Extract specific stats (customize selectors based on the page structure)

    position_element = soup.find('strong', text="Position:")
    if position_element:
        # Find the parent <p> tag and extract the text
        position_text = position_element.find_parent('p').text
        # Use regex to match any position like DF, MF, GK, FW, etc., with optional suffixes
        match = re.search(r'\b(?:FW|MF|DF|GK)(?:-[A-Z]+)*\b', position_text)
        position = match.group(0) if match else "N/A"  # Extracted or fallback
    else:
        position = "N/A"  # Fallback if not found

    club_element = soup.find('strong', string="Club:")
    if club_element:
        team = club_element.find_next('a').text.strip()
    else:
        team = "N/A"  # Fallback if not found

    goals_element = soup.find('span', {'class': 'poptip', 'data-tip': 'Goals scored or allowed'})
    if goals_element:
        goals = goals_element.find_next('p').text.strip()
    else:
        goals = "N/A"  # Fallback if not found

    asst_element = soup.find('span', {'class': 'poptip', 'data-tip': 'Assists'})
    if asst_element:
        assists = asst_element.find_next('p').text.strip()
    else:
        assists = "N/A"  # Fallback if not found


    # Add player info to the list

    player_data.append({
        "name": str(name),
        "position": str(position),
        "team": str(team),
        "goals": str(goals),
        "assists": str(assists),
    })


    

# Print player data
print(player_data)

# Save player data to a JSON file
with open('playersnew.json', 'w') as file:
    json.dump(player_data, file, indent=4)

print("Player data saved to players.json!")
