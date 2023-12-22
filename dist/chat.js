"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("./connection");
const rxdb_1 = require("rxdb");
const chatRouter = express_1.default.Router();
exports.chatRouter = chatRouter;
chatRouter.post('/add', async (req, res) => {
    const { uid, name, avatar } = req.body;
    const collection = connection_1.db.group;
    collection.insertUser(uid, name, avatar)
        .then((doc) => {
        res.status(200).json(doc);
    })
        .catch((error) => {
        res.status(204).json({ "message": `error ${error}` });
    });
});
chatRouter.get('/getAll', async (req, res) => {
    const collection = connection_1.db.group;
    await collection.find().exec().then((documents) => {
        res.status(200).json(documents);
    });
});
chatRouter.delete('/delete', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.group;
    await collection.findOne(id).exec().then(async (document) => {
        if ((0, rxdb_1.isRxDocument)(document)) {
            await document.remove().then(async (doc) => {
                res.status(200).json(doc);
            }).catch((error) => console.log('error'));
        }
        else {
            res.status(204).json({ "message": ' error' });
        }
    });
});
chatRouter.get('/getOne', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.group;
    await collection.findOne(id).exec().then((document) => {
        res.status(200).json(document);
    });
});
