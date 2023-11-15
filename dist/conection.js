"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.setDB = void 0;
const rxdb_1 = require("rxdb");
const storage_memory_1 = require("rxdb/plugins/storage-memory");
let db;
const initDatabase = async () => {
    const db = await (0, rxdb_1.createRxDatabase)({
        name: 'medic',
        storage: (0, storage_memory_1.getRxStorageMemory)()
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
                        maxLength: 100
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
async function setDB() {
    exports.db = db = await initDatabase();
}
exports.setDB = setDB;
