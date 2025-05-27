from flask import Flask, request
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import pickle

# Command flask --app main run

app = Flask(__name__)


@app.route("/predict", methods=['POST'])
def predict():
    model: RandomForestClassifier = None

    with open("riot_classifier.pkl", "rb") as file:
        model = pickle.load(file)

    data = request.get_json()

    print(data)

    mapData = {
        'duration': [data['duration']],
        'blue_top': [data['blueTop']],
        'blue_jg': [data['blueJG']],
        'blue_mid': [data['blueMid']],
        'blue_bot': [data['blueBot']],
        'blue_supp': [data['blueSupp']],

        'red_top': [data['redTop']],
        'red_jg': [data['redJG']],
        'red_mid': [data['redMid']],
        'red_bot': [data['redBot']],
        'red_supp': [data['redSupp']],

        'gold_difference': [data['goldDifference']],

        'blue_champ_kills': [data['blueChampKills']],
        'red_champ_kills': [data['redChampKills']],

        'blue_tower_kills': [data['blueTowerKills']],
        'red_tower_kills': [data['redTowerKills']],

        'blue_grubs': [data['blueGrubs']],
        'red_grubs': [data['redGrubs']],

        'blue_heralds': [data['blueHeralds']],
        'red_heralds': [data['redHeralds']],

        'blue_dragons': [data['blueDragons']],
        'red_dragons': [data['redDragons']],

        'blue_barons': [data['blueBaron']],
        'red_barons': [data['redBaron']],

        'blue_atakhan': [data['blueAtakhan']],
        'red_atakhan': [data['redAtakhan']],
    }

    df = pd.DataFrame.from_dict(mapData)

    prediction = model.predict_proba(df)

    retval = {
        'blue': prediction[0][0],
        'red': prediction[0][1],
        'minute': round(data['duration'] / 60)  # Get in minutes
    }

    return retval
