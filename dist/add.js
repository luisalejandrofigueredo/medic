"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRouter = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("./connection");
const rxdb_1 = require("rxdb");
const uuid_1 = require("uuid");
const addRouter = express_1.default.Router();
exports.addRouter = addRouter;
addRouter.post('/add', async (req, res) => {
    let { firstName, lastName, bloodPressureMax, bloodPressureMin, pulse, oxygen } = req.body;
    firstName = decodeURI(firstName);
    lastName = decodeURI(lastName);
    const collection = connection_1.db.vital_sings;
    try {
        const id = (0, uuid_1.v4)();
        const doc = await collection.insert({ id: (0, uuid_1.v4)(), firstName: firstName, lastName: lastName, bloodPressureMax: bloodPressureMax, bloodPressureMin: bloodPressureMin, pulse: pulse, oxygen: oxygen });
        console.log('id:', id);
        res.status(200).json({ "message": "ok" });
    }
    catch (error) {
        res.status(204).json({ "message": "error" });
    }
});
addRouter.put('/put', async (req, res) => {
    let { id, firstName: firstName, lastName: lastName, bloodPressureMax, bloodPressureMin, pulse, oxygen } = req.body;
    firstName = decodeURI(firstName);
    lastName = decodeURI(lastName);
    const collection = connection_1.db.vital_sings;
    let document = await collection.findOne(id).exec();
    if ((0, rxdb_1.isRxDocument)(document)) {
        document.patch({
            firstName: firstName,
            lastName: lastName,
            bloodPressureMin: bloodPressureMin,
            bloodPressureMax: bloodPressureMax,
            pulse: pulse,
            oxygen: oxygen
        });
    }
    res.status(200).json({ "message": "ok" });
});
addRouter.get('/getOne', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.vital_sings;
    await collection.findOne(id).exec().then((document) => {
        res.status(200).json(document);
    });
});
addRouter.delete('/delete', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.vital_sings;
    await collection.findOne(id).exec().then(async (document) => {
        await document.remove().then((doc) => {
            res.status(200).json(doc);
        });
    });
});
addRouter.get('/getAll', async (req, res) => {
    const collection = connection_1.db.vital_sings;
    await collection.find().exec().then((documents) => {
        res.status(200).json(documents);
    });
});
