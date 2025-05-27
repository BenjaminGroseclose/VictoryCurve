
DROP TABLE IF EXISTS #MainPlayerIDs
DROP TABLE IF EXISTS #TeamMap
DROP TABLE IF EXISTS #PositionCatMap
DROP TABLE IF EXISTS #NewPeople
DROP TABLE IF EXISTS #Batters
DROP TABLE IF EXISTS #Pitchers

--SELECT * FROM People WHERE nameLast = 'Semien' AND nameFirst = 'Marcus'
--SELECT * FROM Batting WHERE playerID = 'semiema01' and yearID = 2023

CREATE TABLE #PositionCatMap
(
	Position VARCHAR(10) NOT NULL,
	Category VARCHAR(10) NOT NULL
)

INSERT INTO #PositionCatMap
VALUES
( 'C', 'IF')
,( '1B', 'IF')
,( '2B', 'IF')
,( '3B', 'IF')
,( 'SS', 'IF')
,( 'OF', 'OF')
,( 'P', 'P')

CREATE TABLE #TeamMap
(
	TeamID INT NOT NULL
	,ExternalFranchID VARCHAR(3) NOT NULL
)

CREATE TABLE #NewPeople
(
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    DateOfBirth DATE NULL,
    PositionCategory VARCHAR(5)  NOT NULL,
    Position VARCHAR(5) NOT NULL,
    BatHand VARCHAR(15) NULL,
    ThrowHand VARCHAR(15) NULL, 
    [Status] VARCHAR(50) NOT NULL,
    LahmanPlayerID VARCHAR(100) NULL,
)

CREATE TABLE #Pitchers
(
    PlayerID INT NULL,
    TeamID INT NOT NULL,
    Season INT NOT NULL,
    SeasonType INT NOT NULL,
    Games INT NOT NULL,
    Starts INT NOT NULL,
    Wins INT NOT NULL,
    Losses INT NOT NULL,
    Saves INT NOT NULL,
    InningsPitched FLOAT NOT NULL,
    ERA FLOAT NOT NULL,
    EarnedRuns INT NOT NULL,
    Hits INT NOT NULL,
    HomeRuns INT NOT NULL,
    Strikeouts INT NOT NULL,
    StrikeoutsPerNineInnings FLOAT NOT NULL,
    Walks INT NOT NULL,
    WalksPerNineInnings FLOAT NOT NULL,
    WHIP FLOAT NOT NULL,
    BattingAverageAgainst FLOAT NOT NULL,
    OBP FLOAT NOT NULL,
    Shutouts INT NOT NULL,
		ExternalPlayerID VARCHAR(100) NOT NULL
)

CREATE TABLE #Batters 
(
    PlayerID INT NULL,
    TeamID INT NOT NULL,
    Season INT NOT NULL,
    SeasonType INT NOT NULL,
    Games INT NOT NULL,
    AtBats INT NOT NULL,
    Runs INT NOT NULL,
    Hits INT NOT NULL,
    Doubles INT NOT NULL,
    Triples INT NOT NULL,
    HomeRuns INT NOT NULL,
    RunsBattedIn INT NOT NULL,
    BattingAverage FLOAT NOT NULL,
    Strikeouts INT NOT NULL,
    Walks INT NOT NULL,
    HitByPitch INT NOT NULL,
    Steals INT NOT NULL,
    CaughtStealing INT NOT NULL,
    OBP FLOAT NOT NULL,
    Slug FLOAT NOT NULL,
    [OBPPlus] FLOAT NOT NULL,
	ExternalPlayerID VARCHAR(100) NOT NULL
)

INSERT INTO #TeamMap (TeamID, ExternalFranchID)
VALUES 
(1, 'LAD'),
(2, 'CIN'),
(3, 'TOR'),
(4, 'PIT'),
(5, 'KCR'),
(6, 'CHC'),
(7, 'CLE'),
(8, 'TBD'),
(9, 'PHI'),
(10, 'SEA'),
(11, 'ARI'),
(12, 'SFG'),
(13, 'CHW'),
(14, 'DET'),
(15, 'NYM'),
(16, 'BAL'),
(17, 'MIN'),
(18, 'ANA'),
(19, 'FLA'),
(20, 'COL'),
(21, 'OAK'),
(22, 'BOS'),
(23, 'ATL'),
(24, 'TEX'),
(25, 'NYY'),
(26, 'HOU'),
(27, 'STL'),
(28, 'MIL'),
(29, 'SDP'),
(30, 'WSN')

--SELECT * FROM #TeamMap

CREATE TABLE #MainPlayerIDs
(
	ID INT NULL
	,ExternalPlayerID VARCHAR(100) NOT NULL,
)

INSERT INTO #MainPlayerIDs
(
	ID
	,ExternalPlayerID
)
SELECT
	pmlb.PlayerID
	,p.playerID
FROM 
	dbo.People p 
	JOIN dbo.Batting b 
		ON b.playerID = p.playerID
		AND b.yearID >= 1990
	LEFT JOIN dbo.PlayerMLB pmlb ON
		pmlb.LastName = p.nameLast
		AND pmlb.FirstName = p.nameFirst
		AND pmlb.DateOfBirth = (CAST(p.birthYear AS VARCHAR) + '-' + CAST(p.birthMonth  AS VARCHAR) + '-' + CAST(p.birthDay  AS VARCHAR))
GROUP BY
	pmlb.PlayerID
	,p.playerID

--SELECT COUNT(*) FROM #MainPlayerIDs WHERE ID IS NULL 
--SELECT COUNT(*) FROM #MainPlayerIDs WHERE ID IS NOT NULL 
--SELECT * FROM #MainPlayerIDs

---- Batting
--INSERT INTO #Batters
--SELECT
--	mpi.ID AS [PlayerID]
--	,tm.TeamID AS [TeamID]
--	,b.yearID AS [Season]
--	,1 AS [SeasonType] -- Regular Season
--	,b.G AS [Games]
--	,b.AB AS [AtBats]
--	,b.R AS [Runs]
--	,b.H AS [Hits]
--	,b.[2B] AS [Doubles]
--	,b.[3B] AS [Triples]
--	,b.HR AS [HomeRuns]
--	,b.RBI AS [RunsBattedIn]
--	,CAST(ROUND(b.H * 1.0 / b.AB, 3) AS FLOAT) AS [BattingAverage]
--	,b.SO AS [Strikeouts]
--	,b.BB AS [Walks]
--	,b.HBP AS [HitByPitch]
--	,b.SB AS [Steals]
--	,b.CS AS [CaughtStealing]
--	,CAST(ROUND((b.H + b.BB + b.HBP) * 1.0 / (b.AB + b.BB + b.HBP + b.SF), 3) AS FLOAT) AS [OBP]
--	,CAST(ROUND(( b.H + b.[2B] +2*b.[3B] + 3*b.HR) * 1.0 / b.AB, 3) AS FLOAT) AS [Slug]
--	,CAST(ROUND(((b.H + b.BB + b.HBP) * 1.0 / (b.AB + b.BB + b.HBP + b.SF)) + (( b.H + b.[2B] +2*b.[3B] + 3*b.HR) * 1.0 / b.AB), 3) AS FLOAT) AS [OBPPlus]
--	,mpi.ExternalPlayerID
--FROM 
--	#MainPlayerIDs mpi
--	LEFT JOIN PlayerMLB pmlb ON mpi.ID = pmlb.PlayerID
--	JOIN Batting  b ON b.playerID = mpi.ExternalPlayerID
--	JOIN Teams t ON t.teamID = b.teamID AND t.yearID = b.yearID
--	JOIN #TeamMap tm ON tm.ExternalFranchID = t.franchID
--WHERE
--	b.AB > 0 AND b.yearID >= 1990

---- 23
--INSERT INTO #Pitchers 
--SELECT 
--	mpi.ID AS [PlayerID]
--	,tm.TeamID AS [TeamID]
--	,p.yearID AS [Season]
--	,1 AS [SeasonType] -- Regular Season
--	,p.G AS [Games]
--	,p.GS AS [Starts]
--	,p.W AS [Wins]
--	,p.L AS [Losses]
--	,p.SV AS [Saves]
--	,ROUND(p.IPOuts * 1.0 / 3, 3) AS [InningsPitched]
--	-- (Earned Runs / Innings Pitched) x 9 
--	,p.ERA AS [ERA]
--	,p.ER AS [EarnedRuns]
--	,p.H AS [Hits]
--	,p.HR AS [HomeRuns]
--	,p.SO AS [Strikeouts]
--	,ROUND((p.SO * 1.0 / (p.IPOuts * 1.0 / 3)) * 9, 3) AS [StrikeoutsPerNineInnings]
--	,p.BB AS [Walks]
--	,ROUND((p.BB * 1.0 / (p.IPOuts * 1.0 / 3)) * 9, 3) AS [WalksPerNineInnings]
--	,ROUND((p.BB + p.H) * 1.0 / (p.IPOuts * 1.0 / 3), 3) AS [WHIP]
--	,CAST(ROUND(p.H * 1.0 / p.BFP, 3) AS FLOAT) AS [BattingAverageAgainst]
--	,ISNULL(CAST(ROUND(((p.H + p.BB + p.HBP) * 1.0) / (p.BFP + p.BB + p.HBP + p.SF), 3) AS FLOAT), 0) AS [OBP]
--	,p.SHO AS [Shutouts]
--	,mpi.ExternalPlayerID AS [ExternalPlayerID]
--FROM
--	#MainPlayerIDs mpi
--	JOIN Pitching  p ON p.playerID = mpi.ExternalPlayerID
--	JOIN Teams t ON t.teamID = p.teamID AND p.yearID = t.yearID
--	JOIN #TeamMap tm ON tm.ExternalFranchID = t.franchID
--WHERE
--	p.IPOuts > 0 AND p.BFP > 0 AND p.yearID >= 1990

INSERT INTO #NewPeople
SELECT 
	a.FirstName
	,a.LastName
	,a.DateOfBirth
	,pcm.Category AS [PositionCategory]
	,CASE WHEN a.Position = 'P'
		THEN
			CASE WHEN EXISTS (SELECT 1 FROM Pitching pit WHERE pit.playerID = a.[LahmanPlayerID] AND pit.GS > 0) THEN 'P' ELSE 'RP' END
		ELSE a.Position
	END AS [Position]
	,a.BatHand
	,a.ThrowHand
	,a.Status
	,a.LahmanPlayerID
FROM 
(
	SELECT 
		p.nameFirst AS [FirstName]
		,p.nameLast AS [LastName]
		,f.Pos AS [Position]
		,(CAST(p.birthYear AS VARCHAR) + '-' + CAST(p.birthMonth  AS VARCHAR) + '-' + CAST(p.birthDay  AS VARCHAR)) AS [DateOfBirth]
		,p.bats AS [BatHand]
		,p.throws AS [ThrowHand]
		,'Inactive' AS [Status] -- All players should be inactive because they currently do not exist in our 2024 data
		,p.playerID AS [LahmanPlayerID]

		,f.yearID
		,ROW_NUMBER() OVER (PARTITION BY f.playerID ORDER BY f.yearID DESC) AS RowNumber
	FROM
		#MainPlayerIDs mpi
		JOIN People p ON p.playerID = mpi.ExternalPlayerID
		LEFT JOIN Fielding f ON f.playerID = p.playerID
	WHERE 
		mpi.ID IS NULL
		AND p.playerID IN (jimenlu01
			decasyu01
			belnovi01
			wrighro02
			saloman01
			sassero01
			ortegbi01
			casimca01
			lukacro01
			greenad01
			bormajo01
			godwity01
			mullise01
)
) a
JOIN #PositionCatMap pcm ON pcm.Position = a.Position
WHERE a.RowNumber = 1

 SELECT * FROM #NewPeople
--SELECT * FROM #Batters
--SELECT * FROM #Pitchers

SELECT * FROM People p
JOIN Fielding f ON f.playerID = p.playerID
WHERE p.playerID = 'jimenlu01'


SELECT * FROM People p WHERE p.playerID = 'ortegbi01'