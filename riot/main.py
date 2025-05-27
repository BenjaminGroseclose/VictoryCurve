import os
import requests
import time
import json
import pickle
import pandas as pd
import time
from sklearn.ensemble import RandomForestClassifier
import plotly.express as px

game_active = True
items = None
champions = None
model: RandomForestClassifier = None
gameMinute = 0
game_timestamp = time.time()


game_result_df = pd.DataFrame()


def addResults(result, minute, currentResults, data):
    blue = result[0] * 100
    red = result[1] * 100
    game_result_data = {'minute': [minute], 'blue': [blue], 'red': [red]}
    print(game_result_data | data)

    return pd.concat([currentResults, pd.DataFrame(game_result_data | data)])


# print('Sleeping for first 3 mins')
# # Sleep for first 3 mins of the game
# time.sleep(180)
# gameMinute = 3


with open("riot_classifier.pkl", "rb") as f:
    model = pickle.load(f)

with open('items.json', 'r') as file:
    items = json.load(file)

with open('champions.json', 'r', encoding='utf-8') as file:
    champions = json.load(file)


def getChampion(championName):
    for champ in champions['data']:
        if champions['data'][champ]['name'] == championName:
            return champions['data'][champ]['key']


def getChampionID(teamChampions, role):
    for champion in teamChampions:
        if champion['position'] == role:
            return champion['champion_id']


while game_active:
    try:
        # Per docs https://developer.riotgames.com/docs/lol need to make request insecure
        response = requests.get(
            "https://127.0.0.1:2999/liveclientdata/allgamedata", verify=False)

        if response.status_code == 200:
            game_data = response.json()

            blue_champions = []
            red_champions = []

            all_players = game_data["allPlayers"]

            for player in all_players:
                if player['team'] == "ORDER":
                    if player['isBot']:
                        blue_champions.append({
                            "name": player['riotIdGameName'] + ' Bot',
                            "position": player['position'],
                            'champion_id': getChampion(player['championName'])
                        })

                    else:
                        blue_champions.append({
                            "name": player['riotIdGameName'],
                            "position": player['position'],
                            'champion_id': getChampion(player['championName'])
                        })
                else:
                    if player['isBot']:
                        red_champions.append({
                            "name": player['riotIdGameName'] + ' Bot',
                            "position": player['position'],
                            'champion_id': getChampion(player['championName'])
                        })
                    else:
                        red_champions.append({
                            "name": player['riotIdGameName'],
                            "position": player['position'],
                            'champion_id': getChampion(player['championName'])
                        })

            blue_gold = 0
            red_gold = 0
            blue_champion_names = list(
                map(lambda x: x['name'], blue_champions))
            red_champion_names = list(map(lambda x: x['name'], red_champions))

            for player in all_players:
                total_gold = 0
                name = None

                if player['isBot']:
                    name = player['riotIdGameName'] + ' Bot'
                else:
                    name = player['riotIdGameName']

                for item in player['items']:
                    if (item['slot'] != 6):
                        total_gold += items['data'][str(item['itemID'])
                                                    ]['gold']['total']

                if name in blue_champion_names:
                    blue_gold += total_gold
                else:
                    red_gold += total_gold
                print(player['riotIdGameName'], total_gold, '\n\n')

            blue_champion_kill_count = 0
            red_champion_kill_count = 0

            blue_tower_count = 0
            red_tower_count = 0

            blue_herald_count = 0
            red_herald_count = 0

            blue_grub_count = 0
            red_grub_count = 0

            blue_dragon_count = 0
            red_dragon_count = 0

            blue_baron_count = 0
            red_baron_count = 0

            blue_atakhan_count = 0
            red_atakhan_count = 0

            for event in game_data['events']['Events']:
                match event['EventName']:
                    case 'HordeKill':
                        if event['KillerName'] in blue_champion_names:
                            blue_grub_count += 1
                        else:
                            red_grub_count += 1
                    case 'DragonKill':
                        if event['KillerName'] in blue_champion_names:
                            blue_dragon_count += 1
                        else:
                            red_dragon_count += 1
                    case 'AtakhanKill':
                        if event['KillerName'] in blue_champion_names:
                            blue_atakhan_count += 1
                        else:
                            red_atakhan_count += 1
                    case 'BaronKill':
                        if event['KillerName'] in blue_champion_names:
                            blue_baron_count += 1
                        else:
                            red_baron_count += 1
                    case 'ChampionKill':
                        if event['KillerName'] in blue_champion_names:
                            blue_champion_kill_count += 1
                        elif event['KillerName'] in red_champion_names:
                            red_champion_kill_count += 1
                    case 'HeraldKill':
                        if event['KillerName'] in blue_champion_names:
                            blue_herald_count += 1
                        else:
                            red_herald_count += 1
                    case 'TurretKilled':
                        if event['KillerName'] in blue_champion_names:
                            blue_tower_count += 1
                        else:
                            red_tower_count += 1

            print(len(blue_champions))
            print(len(red_champions))

            data = {
                'duration': [game_data['gameData']['gameTime']],
                'blue_top': [getChampionID(blue_champions, 'TOP')],
                'blue_jg': [getChampionID(blue_champions, 'JUNGLE')],
                'blue_mid': [getChampionID(blue_champions, 'MIDDLE')],
                'blue_bot': [getChampionID(blue_champions, 'BOTTOM')],
                'blue_supp': [getChampionID(blue_champions, 'UTILITY')],

                'red_top': [getChampionID(red_champions, 'TOP')],
                'red_jg': [getChampionID(red_champions, 'JUNGLE')],
                'red_mid': [getChampionID(red_champions, 'MIDDLE')],
                'red_bot': [getChampionID(red_champions, 'BOTTOM')],
                'red_supp': [getChampionID(red_champions, 'UTILITY')],

                'gold_difference': [blue_gold - red_gold],

                'blue_champ_kills': [blue_champion_kill_count],
                'red_champ_kills': [red_champion_kill_count],

                'blue_tower_kills': [blue_tower_count],
                'red_tower_kills': [red_tower_count],

                'blue_grubs': [blue_grub_count],
                'red_grubs': [red_grub_count],

                'blue_heralds': [blue_grub_count],
                'red_heralds': [red_grub_count],

                'blue_dragons': [blue_dragon_count],
                'red_dragons': [red_dragon_count],

                'blue_barons': [blue_baron_count],
                'red_barons': [red_baron_count],

                'blue_atakhan': [blue_atakhan_count],
                'red_atakhan': [red_atakhan_count],
            }

            df = pd.DataFrame.from_dict(data)

            prediction = model.predict_proba(df)
            game_result_df = addResults(
                prediction[0], gameMinute, game_result_df, data)

            print('--------')
            print('Blue Side:', prediction[0][0] * 100)
            print('Red Side:', prediction[0][1] * 100)
            print('--------', '\n')

        else:
            print('Game Data request failed:', response)
            game_active = False

        # Once every min
        time.sleep(60)
        gameMinute += 1
    except Exception as e:
        print(e)
        print('Error occured, game is over, or never was started.')
        game_active = False

        outdir = f'./game-results/{game_timestamp}'
        if not os.path.exists(outdir):
            os.mkdir(outdir)

        print(game_result_df.head())

        chart = px.line(game_result_df, x="minute", y=['blue', 'red'])
        chart.update_layout(yaxis_title="Win %")

        game_result_df.to_csv(f"{outdir}/game.csv")
        chart.write_html(f"{outdir}/game-result.html")
