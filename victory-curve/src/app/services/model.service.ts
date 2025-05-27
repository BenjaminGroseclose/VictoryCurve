import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IModelData } from '../models/model-data.type';
import { IModelPrediction } from '../models/model-prediction.type';

@Injectable()
export class ModelService {
  constructor(protected http: HttpClient) {}

  getPrediction(data: IModelData): Observable<IModelPrediction> {
    return this.http.post<IModelPrediction>(
      'http://127.0.0.1:5000/predict',
      data
    );
  }
}
