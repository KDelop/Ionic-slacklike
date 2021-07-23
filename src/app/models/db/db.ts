import Dexie from 'dexie';
import { IOrgResponse, IOrgDb, Igtbl } from '..';
import { orderBy, find, uniqBy, merge, cloneDeep } from 'lodash';
import { IRecentItems } from '../interfaces/recent-items.interface';
// import { Observable, of } from 'rxjs';
// import { RealTimeResponse } from '../classes';
export class OrgsDbModel implements IOrgResponse {
  public id: string;
  public name: string;
  public domain: string;
  public token: string;
  public isActive: boolean;
  public whitelistedDomains?: string[];
  public public: boolean;
  constructor() {
    //
  }
}
export class DataByOrgsModel implements IOrgDb {
  public id: string;
  public name: string;
  public aidata: Igtbl;
  public recentChannels: IRecentItems[];
  public recentUsers: IRecentItems[];
  constructor() {
    this.aidata = {
      orgUsers: [],
    };
  }
}

class AppDatabase extends Dexie {
  public orgs: Dexie.Table<IOrgResponse, string>;
  public dataByOrgs: Dexie.Table<IOrgDb, string>;
  constructor() {
    super('_kiss');
    this.version(3).stores({
      orgs: '&id',
      dataByOrgs: '&id',
      userPreferences: '&id',
    });
    this.version(2).stores({
      orgs: '&id',
      dataByOrgs: '&id',
    });
    this.version(1).stores({
      orgs: '++id,updatedBy,createdAt,updatedAt,name,domain,token,isActive',
    });
    // directly on retrieved database objects.
    this.orgs.mapToClass(OrgsDbModel);
    this.dataByOrgs.mapToClass(DataByOrgsModel);
  }

  public getRecentItems(orgId: string, type): Promise<IRecentItems[]> {
    // const o: IOrgDb = new DataByOrgsModel();
    // o.id = 1;
    // o.name = 'Walkover';
    // this.dataByOrgs.put(o);
    return this.dataByOrgs.get(orgId).then((res: IOrgDb) => {
      if (res && type === 'CHANNEL' && res.recentChannels) {
        return res.recentChannels;
      } else if (res && type === 'USER' && res.recentUsers) {
        return res.recentUsers;
      } else {
        return [];
      }
    });
  }

  public upsertRecentItems(
    orgId,
    model: { recentItems: IRecentItems[] },
    type
  ): Promise<IRecentItems[]> {
    return this.dataByOrgs.get(orgId).then((res: IOrgDb) => {
      if (res) {
        const updatedData = cloneDeep(res);
        if (type === 'CHANNEL') {
          updatedData.recentChannels = model.recentItems;
          if (updatedData && updatedData.recentChannels) {
            return this.dataByOrgs.put(updatedData).then((val) => {
              if (val) {
                return updatedData.recentChannels;
              }
            });
          }
        } else {
          updatedData.recentUsers = model.recentItems;
          if (updatedData && updatedData.recentUsers) {
            return this.dataByOrgs.put(updatedData).then((val) => {
              if (val) {
                return updatedData.recentUsers;
              }
            });
          }
        }
      }
    });
  }

  public getAllOrgs(): Promise<IOrgResponse[]> {
    return this.orgs.toArray();
  }

  public getOrgById(key: string): Promise<IOrgResponse> {
    return this.orgs.get(key);
  }

  public getDataByOrgs(key: string): Promise<any> {
    return this.dataByOrgs.get(key);
  }

  public addDataByOrgs(model: IOrgResponse): Promise<string> {
    // inserting data into aidb
    const o: IOrgDb = new DataByOrgsModel();
    o.id = model.id;
    o.name = model.name;
    return this.dataByOrgs.put(o);
  }

  public delOrgById(key: string): Promise<any> {
    return this.orgs.delete(key);
  }

  public addOrg(model: IOrgResponse): Promise<string> {
    // inserting data into aidb
    const o: IOrgDb = new DataByOrgsModel();
    o.id = model.id;
    o.name = model.name;
    this.dataByOrgs.put(o);
    return this.orgs.put(model);
  }
}

export let DB = new AppDatabase();
