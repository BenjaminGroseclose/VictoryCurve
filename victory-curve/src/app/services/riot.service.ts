import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class RiotService {
  constructor(protected http: HttpClient) {}

  getLiveData(): Observable<any> {
    return this.http.get('https://127.0.0.1:2999/liveclientdata/allgamedata');
  }

  getChampions(): Observable<any> {
    return this.http.get('./assets/champions.json');
  }

  getItems(): Observable<any> {
    return this.http.get('./assets/items.json');
  }
}
