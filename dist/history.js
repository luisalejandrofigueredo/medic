"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyRouter = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("./connection");
const rxdb_1 = require("rxdb");
const historyRouter = express_1.default.Router();
exports.historyRouter = historyRouter;
historyRouter.delete('/delete', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.history;
    await collection.findOne(id).exec().then(async (document) => {
        await document.remove().then(async (doc) => {
            await collection.renumber(doc.get("idPatient")).then((documents) => {
                res.status(200).json(doc);
            }).catch((_error) => { console.log('error en renumber'); });
        }).catch((error) => console.log('error'));
    });
});
historyRouter.post('/add', async (req, res) => {
    const { idPatient, date, history } = req.body;
    const collection = connection_1.db.history;
    collection.insertWithUniqueKeyAndItemNumber({ idPatient: idPatient, date: date, history: history })
        .then((doc) => {
        res.status(200).json(doc);
    })
        .catch((error) => {
        res.status(204).json({ "message": `error ${error}` });
    });
});
historyRouter.get('/getAll', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.history;
    await collection.find({ selector: { idPatient: { $eq: id } }, sort: [{ item: 'asc' }] }).exec().then((documents) => {
        res.status(200).json(documents);
    });
});
historyRouter.get('/getOne', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.history;
    await collection.findOne(id).exec().then((document) => {
        res.status(200).json(document);
    });
});
historyRouter.put('/put', async (req, res) => {
    const { id, date, history } = req.body;
    const collection = connection_1.db.history;
    let document = await collection.findOne(id).exec();
    if ((0, rxdb_1.isRxDocument)(document)) {
        document.patch({
            date: date,
            history: history
        });
    }
    res.status(200).json({ "message": "ok" });
});
