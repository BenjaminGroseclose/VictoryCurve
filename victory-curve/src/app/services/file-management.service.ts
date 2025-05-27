import { Injectable } from '@angular/core';
const { ipcRenderer } = (window as any).require('electron');

@Injectable()
export class FileManagementService {
  constructor() {}

  async getJsonFile<T>(path: string): Promise<T> {
    return (await ipcRenderer.invoke('read-json-file', path)) as T;
  }
}
