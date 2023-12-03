import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
const medicationRouter = express.Router();
export { medicationRouter };

medicationRouter.post('/add', async (req: Request, res: Response) => {
  const { id, name, canty } = req.body;
  const collection = db.medication;
  collection.insertWithUniqueKeyAndItemNumber({ idPatient: id, name: name, canty: canty })
  .then((doc: any) => {
    res.status(200).json(doc);
  })
  .catch((error: any) =>{
     res.status(204).json({ "message": `error ${error}` })
    })})
