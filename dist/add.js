"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRouter = void 0;
const express_1 = __importDefault(require("express"));
const conection_1 = require("./conection");
const rxdb_1 = require("rxdb");
const addRouter = express_1.default.Router();
exports.addRouter = addRouter;
addRouter.post('/add', async (req, res) => {
    const { id, bloodPressureMax, bloodPressureMin, pulse } = req.body;
    const collection = conection_1.db.vitalSings;
    const doc = await collection.insert({ id: id, bloodPressureMax: bloodPressureMax, bloodPressureMin: bloodPressureMin, pulse: pulse });
    res.status(200).json({ "message": "ok" });
});
addRouter.put('/put', async (req, res) => {
    const { id, bloodPressureMax, bloodPressureMin, pulse } = req.body;
    const collection = conection_1.db.vitalSings;
    let document = await collection.findOne(id).exec();
    if ((0, rxdb_1.isRxDocument)(document)) {
        document.patch({
            bloodPressureMin: bloodPressureMin,
            bloodPressureMax: bloodPressureMax,
            pulse: pulse
        });
    }
    res.status(200).json({ "message": "ok" });
});
addRouter.get('/getAll', async (req, res) => {
    const collection = conection_1.db.vitalSings;
    await collection.find().exec().then((documents) => {
        res.status(200).json(documents);
    });
});
