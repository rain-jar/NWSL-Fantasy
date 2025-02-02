import requests
from bs4 import BeautifulSoup

# URL for the player stats page
url = "https://fbref.com/en/comps/182/NWSL-Stats"

# Fetch the page
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Extract player profile links
player_links = []
for link in soup.select('table.stats_table a'):
    href = link.get('href')
    if '/en/players/' in href:  # Only get player profile links
        full_url = f"https://fbref.com{href}"
        player_links.append(full_url)

# Print the extracted links
print(f"Extracted {len(player_links)} player links:")
for link in player_links:
    print(link)
