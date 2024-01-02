"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationRouter = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("./connection");
const medicationRouter = express_1.default.Router();
exports.medicationRouter = medicationRouter;
medicationRouter.delete('/delete', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.medication;
    await collection.findOne(id).exec().then(async (document) => {
        await document.remove().then(async (doc) => {
            await collection.renumber(doc.get("idPatient")).then((documents) => {
                res.status(200).json(doc);
            }).catch((_error) => { console.log('error en renumber'); });
        }).catch((error) => console.log('error'));
    });
});
medicationRouter.post('/add', async (req, res) => {
    const { idPatient, name, canty, type, units, hora } = req.body;
    const collection = connection_1.db.medication;
    collection.insertWithUniqueKeyAndItemNumber({ idPatient: idPatient, name: name, canty: canty, type: type, units: units, hora: hora })
        .then((doc) => {
        res.status(200).json(doc);
    })
        .catch((error) => {
        res.status(204).json({ "message": `error ${error}` });
    });
});
medicationRouter.get('/getAll', async (req, res) => {
    const id = req.query.id;
    console.log('id', id);
    const collection = connection_1.db.medication;
    await collection.find({ selector: { idPatient: { $eq: id } }, sort: [{ item: 'asc' }] }).exec().then((documents) => {
        res.status(200).json(documents);
    });
});
