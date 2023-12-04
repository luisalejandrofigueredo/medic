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
            minimum:0,
            maximum:10000,
            multipleOf: 1
          },
          name: {
            type: 'string',
            maxLength: 50
          },
          canty: {
            type: 'string',
            maxLength: 50
          }
        },
        required: ['id','idPatient' ,'name'],
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
                  name: data.name,
                  canty: data.canty,
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
        }
      }
    }});
  return db;
};
async function setDB() {
  db = await initDatabase()
}
export { setDB, db }