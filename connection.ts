import { createRxDatabase, RxDocument } from "rxdb";
import {
  getRxStorageMemory
} from 'rxdb/plugins/storage-memory';
import { v4 as uuidv4 } from 'uuid';

let db: any;
const initDatabase = async () => {
  const db = await createRxDatabase({
    name: 'medic',
    storage: getRxStorageMemory()
  });

  // Create a collection with the specified schema
  await db.addCollections({
    vital_sings: {
      schema: {
        title: 'Vital sings',
        version: 0,
        description: "Vital sings patient",
        primaryKey: "id",
        type: "object",
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          firstName: {
            type: 'string',
            maxLength: 50
          },
          lastName: {
            type: 'string',
            maxLength: 50
          },
          bloodPressureMax: {
            type: 'number'
          },
          bloodPressureMin: {
            type: 'number'
          },
          pulse: {
            type: 'number'
          },
          oxygen: {
            type: 'number',
            maximum: 100,
            minimum: 0
          }
        },
        required: ['id']
      },
    },
    medication: {
      schema: {
        title: 'Medication',
        version: 0,
        description: "Medication",
        primaryKey: "id",
        type: "object",
        properties: {
          id: {
            type: "string",
            maxLength: 100,
          },
          idPatient: {
            type: 'string',
            maxLength: 100,
          },
          item: {
            type: "number",
            minimum: 0,
            maximum: 10000,
            multipleOf: 1
          },
          name: {
            type: 'string',
            maxLength: 50
          },
          type: {
            type: 'string',
            maxLength: 10
          },
          units: {
            type: 'string',
            maxLength: 10
          },
          canty: {
            type: 'number',
            maxLength: 10
          },
          hora: {
            type: "number"
          }
        },
        required: ['id', 'idPatient', 'name'],
        indexes: [
          'idPatient',
          ['idPatient', 'item'],
        ]
      },
      statics: {
        async insertWithUniqueKeyAndItemNumber(data: any): Promise<any> {
          return new Promise<any>(async (resolve, reject) => {
            await this.find({ selector: { idPatient: data.idPatient }, sort: [{ item: 'des' }] }).exec().then(async (lastItem: any[]) => {
              const newItemNumber = lastItem.length !== 0 ? lastItem.length + 1 : 1;
              try {
                const newItem = await this.insert({
                  id: uuidv4(),
                  idPatient: data.idPatient,
                  type: data.type,
                  units: data.units,
                  name: data.name,
                  canty: data.canty,
                  hora: data.hora,
                  oxygen: data.oxygen,
                  item: newItemNumber // Utiliza el número de ítem incremental
                });
                resolve(newItem._data);
              } catch (error) {
                reject(`error ${error}`)
              }
            }).catch((error: any) => {
              reject('error')
            });
          })
        },
        async renumber(uuid: string): Promise<any> {
          return new Promise<any>(async (resolve, reject) => {
            await this.find({ selector: { idPatient: uuid }, sort: [{ item: 'asc' }] }).exec().then(async (lastItem: RxDocument[]) => {
              let num = 1;
              lastItem.forEach((document) => {
                document.update({ $set: { item: num } });
                num++;
              });
              resolve(lastItem)
            }).catch((error: any) => {
              reject('error')
            });
          })
        }
      }
    },
    history: {
      schema: {
        title: 'History',
        version: 0,
        description: "History",
        primaryKey: "id",
        type: "object",
        properties: {
          id: {
            type: "string",
            maxLength: 100,
          },
          idPatient: {
            type: 'string',
            maxLength: 100,
          },
          item: {
            type: "number",
            minimum: 0,
            maximum: 10000,
            multipleOf: 1
          },
          date: {
            type: 'number',
          },
          history: {
            type: 'string',
            maxLength: 50000
          }
        },
        required: ['id', 'idPatient'],
        indexes: [
          'idPatient',
          ['idPatient', 'item'],
        ]
      },
      statics: {
        async insertWithUniqueKeyAndItemNumber(data: any): Promise<any> {
          return new Promise<any>(async (resolve, reject) => {
            await this.find({ selector: { idPatient: data.idPatient }, sort: [{ item: 'des' }] }).exec().then(async (lastItem: any[]) => {
              const newItemNumber = lastItem.length !== 0 ? lastItem.length + 1 : 1;
              try {
                const newItem = await this.insert({
                  id: uuidv4(),
                  idPatient: data.idPatient,
                  date: data.date,
                  history: data.history,
                  item: newItemNumber // Utiliza el número de ítem incremental
                });
                resolve(newItem._data);
              } catch (error) {
                reject(`error ${error}`)
              }
            }).catch((error: any) => {
              reject('error')
            });
          })
        },
        async renumber(uuid: string): Promise<any> {
          return new Promise<any>(async (resolve, reject) => {
            await this.find({ selector: { idPatient: uuid }, sort: [{ item: 'asc' }] }).exec().then(async (lastItem: RxDocument[]) => {
              let num = 1;
              lastItem.forEach((document) => {
                document.update({ $set: { item: num } });
                num++;
              });
              resolve(lastItem)
            }).catch((error: any) => {
              reject('error')
            });
          })
        }
      }
    },
    group: {
      schema: {
        title: 'Group',
        version: 0,
        description: "Group chat",
        primaryKey: "uid",
        type: "object",
        properties: {
          uid: {
            type: "string",
            maxLength: 100
          },
          name: {
            type: "string",
            maxLength: 100
          },
          avatar: {
            type: "string",
            maxLength: 100
          }
        },
        required: ['uid', 'name'],
        indexes: ['name']
      },
      statics: {
        insertUser(uid: string, name: string, avatar: string): Promise<any> {
          return new Promise<any>(async (resolve, reject) => {
            try {
              const newUser: RxDocument = await this.insert({
                uid: uid,
                name: name,
                avatar: avatar
              })
              resolve(newUser.toJSON())
            } catch (error) {
              reject(`error ${error}`)
            }
          })
        }
      }
    },
    message: {
      schema: {
        title: 'Messages',
        version: 0,
        description: "chat messages",
        primaryKey: "id",
        type: "object",
        properties: {
          id: {
            type: "string",
            maxLength: 100,
          },
          from: {
            type: "string",
            maxLength: 100,
          },
          to: {
            type: "string",
            maxLength: 100
          },
          hour: {
            type: "number",
            minimum:0,
            maximum:100000000000000,
            multipleOf:.001
          },
          message: {
            type: "string",
            maxLength: 100
          }
        },
        required: [],
        indexes: ['from','to','hour',['to','from','hour']]
      },
      statics: {
        insertMessage(hour: string, from: string, to: string, message: string): Promise<any> {
          return new Promise<any>(async (resolve, reject) => {
            try {
              const newMessage: RxDocument = await this.insert({
                "id": uuidv4(),
                "from": from,
                "to": to,
                "message": message,
                "hour": hour,
              })
              resolve(newMessage)
            } catch (error) {
              reject(`error ${error}`)
            }
          })
        }
      }
    }
  });
  return db;
};
async function setDB() {
  db = await initDatabase()
}
export { setDB, db }