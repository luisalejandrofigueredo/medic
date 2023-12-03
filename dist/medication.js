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
medicationRouter.post('/add', async (req, res) => {
    const { id, name, canty } = req.body;
    const collection = connection_1.db.medication;
    collection.insertWithUniqueKeyAndItemNumber({ idPatient: id, name: name, canty: canty })
        .then((doc) => {
        res.status(200).json(doc);
    })
        .catch((error) => {
        res.status(204).json({ "message": `error ${error}` });
    });
});
