import requests
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
import time
import re

# Base URL for Spirit team stats
TEAM_URL = "https://fbref.com/en/squads/e442aad0/Washington-Spirit-Stats"


# Headers to mimic a browser visit
HEADERS = {"User-Agent": "Mozilla/5.0"}

# Step 1: Get Match Links from Team Page
print("Fetching team page:", TEAM_URL)
try:
    response = requests.get(TEAM_URL, headers=HEADERS)
    response.raise_for_status()  # Raises an error for bad responses (e.g., 404)
except requests.exceptions.RequestException as e:
    print("Error fetching team page:", e)
    with open("error_log.txt", "a") as f:
        f.write(f"Error fetching team page: {e}\n")
    exit()

soup = BeautifulSoup(response.text, "html.parser")

# Find the "Scores & Fixtures" table
matches_table = soup.find("table", {"id": "matchlogs_for"})
if not matches_table:
    print("Match table is not there. Exiting.")


match_links = []
match_opponent = []
goals_against = []


if matches_table:
    for row in matches_table.find("tbody").find_all("tr"):
        match_link_tag = row.find("td", {"data-stat": "match_report"})
        match_opponent_tag = row.find("td", {"data-stat": "opponent"})
        competition_tag = row.find("td", {"data-stat": "comp"})
        goal_against_tag = row.find("td", {"data-stat":"goals_against"})

        if match_link_tag and match_link_tag.find("a") and competition_tag.find("a").text.strip()=="NWSL":
            match_url = "https://fbref.com" + match_link_tag.find("a")["href"]
            match_links.append(match_url)
        if match_opponent_tag and match_opponent_tag.find("a"):
            match_opponent_array = match_opponent_tag.find("a").text.strip()
            match_opponent.append(match_opponent_array)
        if goal_against_tag:
            goals_against.append(goal_against_tag.text.strip())
else:
    print("Match table not found on the page. Exiting.")
    with open("error_log.txt", "a") as f:
        f.write("Match table not found on team page.\n")
    exit()

print(f"✅ Found {len(match_links)} match links.")
print(match_links[0])

# Step 2: Scrape Player-Level Data from Each Match Page

# Start Selenium browser
player_data = []
gk_data = []

for index, match_url in enumerate(match_links[:1]):  # Limit to first 5 matches for testing
    print(f"Scraping match {index+1}/{len(match_links)}: {match_url}")

    driver = webdriver.Chrome()  # Make sure you have chromedriver installed

    # Load the page
    url = match_url
    driver.get(url)
    time.sleep(5)  # Wait for JavaScript to load

    # Get the fully rendered page source
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()


    #GOAL-KEEPER STATS

    gk_stats_header = soup.find("h2", string="Spirit Goalkeeper Stats")

    # Get the parent div that contains this span
    if gk_stats_header:
        gk_stats_div1 = gk_stats_header.find_parent("div")
        gk_stats_div = gk_stats_div1.find_parent("div")
    else:
        gk_stats_div = None  # Handle case where span is not found

    # Debugging
    if gk_stats_div:
        print("Found player stats div:", gk_stats_div["id"])
    else:
        print("Player stats div not found")

    gk_stats_table = gk_stats_div.find_next("table", {"id": lambda x: x and "keeper" in x})

    if not gk_stats_table:
        print("Error: Could not find the player stats table.")
        exit()

    for row in gk_stats_table.find("tbody").find_all("tr"):
        try:
            cells = row.find_all("td")
            gk_name = row.find("th").text.strip()
            gk_saves = cells[5].text.strip()
            gk_data.append({
                "name" : gk_name,
                "saves" : gk_saves
            })

        except Exception as e:
            print(f"⚠ Error processing player row: {e}")
            with open("error_log.txt", "a") as f:
                f.write(f"Error processing player row in match {match_url}: {e}\n")
            continue

    # PLAYER STATS
    
    # Find the correct div containing the player stats table
    # Find the span with the correct data-label

    # Find the table inside the div with id containing "summary"
    player_stats_header = soup.find("h2", string="Spirit Player Stats")

    # Get the parent div that contains this span
    if player_stats_header:
        player_stats_div = player_stats_header.find_parent("div")
    else:
        player_stats_div = None  # Handle case where span is not found

    # Debugging
    if player_stats_div:
        print("Found player stats div:", player_stats_div["id"])
    else:
        print("Player stats div not found")

    player_stats_table = player_stats_div.find_next("table", {"id": lambda x: x and "summary" in x})

    if not player_stats_table:
        print("Error: Could not find the player stats table.")
        exit()
    
        # Extract table headers
    headers = [th.text.strip() for th in player_stats_table.find("thead").find_all("th")]

    gkCount = 0

    for row in player_stats_table.find("tbody").find_all("tr"):
        try:
            cells = row.find_all("td")
            if len(cells) < 5:  # Skip header or invalid rows
                continue

            player_name = row.find("th").text.strip()
            position = cells[2].text.strip()
            team = "Spirit"
            minutes_played = cells[4].text.strip()
            goals = cells[5].text.strip()
            assists = cells[6].text.strip()
            pkMissed = int(cells[8].text.strip()) - int(cells[7].text.strip())
            shots_on_target = cells[10].text.strip()
            yellow_cards = cells[11].text.strip()
            red_cards = cells[12].text.strip()
            opponent = match_opponent[index]
            if (position == "GK"):
                saves = next(d["saves"] for d in gk_data if d["name"] == player_name) 

            else:
                saves = 0

            gA = goals_against[index]
            if (gA == 0):
                cleanSheet = 1
            else:
                cleanSheet = 0
            

            player_data.append({
                "name": player_name,
                "PositionTemp": position,
                "team" : team,
                "Opponent" : opponent,
                "Minutes": minutes_played,
                "goals": goals,
                "assists": assists,
                "PKMissed":pkMissed,
                "Goals Against":gA,
                "Saves" : saves,
                "Clean Sheet" : cleanSheet,
                "Yellow Cards": yellow_cards,
                "Red Cards": red_cards,
                "Match URL": match_url
            })
        
        except Exception as e:
            print(f"⚠ Error processing player row: {e}")
            with open("error_log.txt", "a") as f:
                f.write(f"Error processing player row in match {match_url}: {e}\n")
            continue


print(f"✅ Scraped {len(player_data)} player records.")

# Step 3: Save Data to CSV
if player_data:
    df = pd.DataFrame(player_data)
    df.to_csv("Spirit_match_logs.csv", index=False)
    print("✅ Data saved to Spirit_match_logs.csv")
else:
    print("❌ No player data found to save.")


