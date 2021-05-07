import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  Database: any;
  organismes: any;
  agences: any;
  constructor(private http: HttpClient) {
    if (window.openDatabase !== undefined) {
      const db = window.openDatabase(
        'OpenDataDB.db',
        '1.0',
        'DEV',
        100 * 1024 * 1024
      );
      this.Database = db;
    }
    this.http
      .get('https://localhost:3131/api/getListOrganisme')
      .subscribe((res: any) => {
        this.organismes = res;
        if (window.openDatabase === undefined) {
          localStorage.setItem('organismes', JSON.stringify(this.organismes));
        } else {
          const db = window.openDatabase(
            'OpenDataDB.db',
            '1.0',
            'DEV',
            100 * 1024 * 1024
          );
          this.Database = db;
          this.InsertOrganisme(this.organismes);
        }
      });
    this.http
      .get('https://localhost:3131/api/getListALLAgence')
      .subscribe((res: any) => {
        this.agences = res;
        if (window.openDatabase === undefined) {
          localStorage.setItem('agences', JSON.stringify(this.agences));
        } else {
          const db = window.openDatabase(
            'OpenDataDB.db',
            '1.0',
            'DEV',
            100 * 1024 * 1024
          );
          this.Database = db;
          this.InsertAgence(this.agences);
        }
      });
  }
  InsertAgence(agences) {
    this.Database.transaction((SQLtransaction) => {
      const CreationQuery =
        "CREATE TABLE IF NOT EXISTS 'agences' (codeorganisme text,codeagence text PRIMARY KEY,agence text)";
      SQLtransaction.executeSql(
        CreationQuery,
        [],
        (transaction, resultSet) => {
          agences.forEach((agence) => {
            const InsertionQuery = `REPLACE into 'agences' (codeorganisme, codeagence, agence)  values('${agence.codeorganisme}','${agence.codeagence}','${agence.agence}' )`;
            SQLtransaction.executeSql(
              InsertionQuery,
              [],
              (transaction, resultSet) => {},
              (transaction, error) => {
                console.log('Error inserting agences', error);
              }
            );
          });
        },
        (transaction, error) => {
          console.log('Error creating agences', error);
        }
      );
    });
  }
  InsertOrganisme(organismes) {
    this.Database.transaction((SQLtransaction) => {
      const CreationQuery =
        "CREATE TABLE IF NOT EXISTS 'organismes' (codeorganisme text PRIMARY KEY,organisme text)";
      SQLtransaction.executeSql(
        CreationQuery,
        [],
        (transaction, resultSet) => {
          organismes.forEach((organisme) => {
            const InsertionQuery = `REPLACE into 'organismes' (codeorganisme, organisme)  values('${organisme.codeorganisme}','${organisme.organisme}' )`;
            SQLtransaction.executeSql(
              InsertionQuery,
              [],
              (transaction, resultSet) => {},
              (transaction, error) => {
                console.log('Error inserting organismes', error);
              }
            );
          });
        },
        (transaction, error) => {
          console.log('Error inserting organismes', error);
        }
      );
    });
  }

  getOrganismes() {
    return new Promise((resolve, reject) => {
      if (this.Database === undefined) {
        resolve(JSON.parse(localStorage.getItem('organismes')))
      }else{
        this.Database.transaction((SQLtransaction) => {
          const GettingQuery = 'select codeorganisme, organisme from organismes;';
          SQLtransaction.executeSql(
            GettingQuery,
            [],
            (transaction, resultSet) => {
              resolve(resultSet);
            },
            (transaction, error) => {
              console.log('Error getting organismes', error);
              reject(error);
            }
          );
        });
      }
    });
  }
  getAgenceByOrganisme(organisme) {
    return new Promise((resolve, reject) => {
      if (this.Database === undefined){
        let agences:any[] = JSON.parse(localStorage.getItem('agences'))
        let filtredAgences = agences.filter(agence=>agence.codeorganisme===organisme)
        resolve(filtredAgences)
      }else{
        this.Database.transaction((SQLtransaction) => {
          const GettingQuery = `select codeagence, agence from agences where codeorganisme='${organisme}';`;
          SQLtransaction.executeSql(
            GettingQuery,
            [],
            (transaction, resultSet) => {
              resolve(resultSet);
            },
            (transaction, error) => {
              console.log(
                `Error getting agence by organisme ${organisme}`,
                error
              );
              reject(error);
            }
          );
        }); 
      }
    });
  }
}
