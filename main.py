# Machine Learning File



# Idea: Allow users to adjust this in the UI based on their league
def calcFantasyBattingScoreYahoo(row):
	yahooScoringMap = {
		'AtBats': -0.25,
		'Runs': 1,
		'Hits': 1.25,
		'Doubles': 0.25, # Would be add on from the hits for a total of 1.5 per double
		'Triples': 0.5,
		'HomeRuns': 2.25,
		'RBI': 1,
		'Steals': 2.5,
		'Walks': 0.75,
		'HitByPitch': 0.75
	}

	retval = 0

	for key in yahooScoringMap:
		retval += row[key] * yahooScoringMap[key]

	return retval
		


fantasy_map = {}
missing_players = []
dup_players = []

player_ranking = pd.read_csv('PlayerRankings-2020.csv')

for index, row in player_ranking.iterrows():
	rslt_df = players[players['FullName'] == row.Name]
	if (rslt_df.size == 0):
		missing_players.append(row.Name)
		continue

	if (rslt_df.shape[0] > 1):
		condition1 = rslt_df['Position'] == row.Pos
		condition2 = rslt_df['PositionCategory'] == row.Pos
		rslt_df = rslt_df[condition1 | condition2]

		if (rslt_df.shape[0] != 1):
			dup_players.append(row.Name)
			continue

	playerID = rslt_df.iloc[0]['PlayerID']

	fantasy_map[playerID] = (row.Round, row.Rank)