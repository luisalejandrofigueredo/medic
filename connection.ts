import { createRxDatabase,RxDocument } from "rxdb";
import {
    getRxStorageMemory
  } from 'rxdb/plugins/storage-memory';
let db:any;
const initDatabase = async () => {
    const db = await createRxDatabase({
      name: 'medic',
      storage: getRxStorageMemory()
    });
  
    // Create a collection with the specified schema
    await db.addCollections({
      vitalSings: {
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
            firstName:{
              type:'string',
              maxLength:50
            },
            lastName:{
              type:'string',
              maxLength:50
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
      }
    });
  
    return db;
  };

  async function  setDB(){
    db=await initDatabase()
  }



  export {setDB,db}