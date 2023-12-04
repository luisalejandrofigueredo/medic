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
    console.log(id);
    await collection.findOne(id).exec().then(async (document) => {
        await document.remove().then((doc) => {
            res.status(200).json(doc);
        });
    });
});
medicationRouter.post('/add', async (req, res) => {
    const { idPatient, name, canty } = req.body;
    const collection = connection_1.db.medication;
    console.log('entre a agregar medicamento');
    collection.insertWithUniqueKeyAndItemNumber({ idPatient: idPatient, name: name, canty: canty })
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
    await collection.find({ selector: { idPatient: { $eq: id } } }).exec().then((documents) => {
        res.status(200).json(documents);
    });
});
