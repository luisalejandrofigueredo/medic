"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("./connection");
const rxdb_1 = require("rxdb");
const messageRouter = express_1.default.Router();
exports.messageRouter = messageRouter;
messageRouter.post('/add', async (req, res) => {
    const { hour, from, to, message } = req.body;
    const collection = connection_1.db.message;
    collection.insertMessage(hour, from, to, message)
        .then((doc) => {
        res.status(200).json(doc);
    })
        .catch((error) => {
        res.status(204).json({ "message": `error ${error}` });
    });
});
messageRouter.get('/getAll', async (req, res) => {
    const collection = connection_1.db.message;
    await collection.find().exec().then((documents) => {
        res.status(200).json(documents);
    });
});
messageRouter.get('/getFromTo', async (req, res) => {
    const id = req.query.id;
    const collection = connection_1.db.message;
    const query = await collection.find({
        selector: { $or: [{ to: id }, { from: id }] },
        sort: [{ hour: 'desc' }]
    });
    await query.exec().then((documents) => {
        res.status(200).json(documents);
    });
});
messageRouter.get('/getFromToMessages', async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    const collection = connection_1.db.message;
    console.log('from', from);
    console.log('to', to);
    const query = await collection.find({
        selector: {
            $or: [{ to: to, hour: { gt$: Date.now() - 24 * 60 * 60 * 1000 } }, { from: from, hour: { gt$: Date.now() - 24 * 60 * 60 * 1000 } }, { to: from, hour: { gt$: Date.now() - 24 * 60 * 60 * 1000 } }, { from: to, hour: { gt$: Date.now() - 24 * 60 * 60 * 1000 } }]
        },
        sort: [{ hour: 'desc' }]
    });
    console.log('is query ', (0, rxdb_1.isRxQuery)(query));
    try {
        const result = await query.exec();
        console.log(result);
        res.status(200).json(result);
    }
    catch (error) {
        console.log('error', error);
    }
});
