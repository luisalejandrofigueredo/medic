"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.setDB = void 0;
const rxdb_1 = require("rxdb");
const storage_memory_1 = require("rxdb/plugins/storage-memory");
const uuid_1 = require("uuid");
let db;
const initDatabase = async () => {
    const db = await (0, rxdb_1.createRxDatabase)({
        name: 'medic',
        storage: (0, storage_memory_1.getRxStorageMemory)()
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
                    }
                },
                required: ['id', 'idPatient', 'name'],
                indexes: [
                    'idPatient',
                    ['idPatient', 'item'],
                ]
            },
            statics: {
                async insertWithUniqueKeyAndItemNumber(data) {
                    return new Promise(async (resolve, reject) => {
                        await this.find({ selector: { idPatient: data.idPatient }, sort: [{ item: 'des' }] }).exec().then(async (lastItem) => {
                            const newItemNumber = lastItem.length !== 0 ? lastItem.length + 1 : 1;
                            try {
                                const newItem = await this.insert({
                                    id: (0, uuid_1.v4)(),
                                    idPatient: data.idPatient,
                                    type: data.type,
                                    units: data.units,
                                    name: data.name,
                                    canty: data.canty,
                                    item: newItemNumber // Utiliza el número de ítem incremental
                                });
                                resolve(newItem._data);
                            }
                            catch (error) {
                                reject(`error ${error}`);
                            }
                        }).catch((error) => {
                            reject('error');
                        });
                    });
                },
                async renumber(uuid) {
                    return new Promise(async (resolve, reject) => {
                        await this.find({ selector: { idPatient: uuid }, sort: [{ item: 'asc' }] }).exec().then(async (lastItem) => {
                            let num = 1;
                            lastItem.forEach((document) => {
                                document.update({ $set: { item: num } });
                                num++;
                            });
                            resolve(lastItem);
                        }).catch((error) => {
                            reject('error');
                        });
                    });
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
                async insertWithUniqueKeyAndItemNumber(data) {
                    return new Promise(async (resolve, reject) => {
                        await this.find({ selector: { idPatient: data.idPatient }, sort: [{ item: 'des' }] }).exec().then(async (lastItem) => {
                            const newItemNumber = lastItem.length !== 0 ? lastItem.length + 1 : 1;
                            try {
                                const newItem = await this.insert({
                                    id: (0, uuid_1.v4)(),
                                    idPatient: data.idPatient,
                                    date: data.date,
                                    history: data.history,
                                    item: newItemNumber // Utiliza el número de ítem incremental
                                });
                                resolve(newItem._data);
                            }
                            catch (error) {
                                reject(`error ${error}`);
                            }
                        }).catch((error) => {
                            reject('error');
                        });
                    });
                },
                async renumber(uuid) {
                    return new Promise(async (resolve, reject) => {
                        await this.find({ selector: { idPatient: uuid }, sort: [{ item: 'asc' }] }).exec().then(async (lastItem) => {
                            let num = 1;
                            lastItem.forEach((document) => {
                                document.update({ $set: { item: num } });
                                num++;
                            });
                            resolve(lastItem);
                        }).catch((error) => {
                            reject('error');
                        });
                    });
                }
            }
        }
    });
    return db;
};
async function setDB() {
    exports.db = db = await initDatabase();
}
exports.setDB = setDB;
