

use main

DROP TABLE IF EXISTS #NewPlayers

CREATE TABLE #NewPlayers
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

BULK INSERT #NewPlayers
FROM 'C:\NewPlayers.csv'
WITH
(
    FORMAT = 'CSV', 
    FIELDQUOTE = '"',
    FIRSTROW = 2,
    FIELDTERMINATOR = ',',  --CSV field delimiter
    ROWTERMINATOR = '\n',   --Use to shift the control to next row
    TABLOCK
)

SELECT * FROM #NewPlayers