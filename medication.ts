import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
const medicationRouter = express.Router();

medicationRouter.delete('/delete', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection: RxCollection = db.medication;
  console.log(id);
  await collection.findOne(id).exec().then(async (document: RxDocument) => {
    await document.remove().then((doc) => {
      res.status(200).json(doc);
    })
  });
})


medicationRouter.post('/add', async (req: Request, res: Response) => {
  const { idPatient, name, canty } = req.body;
  const collection = db.medication;
  console.log('entre a agregar medicamento');
  collection.insertWithUniqueKeyAndItemNumber({ idPatient: idPatient, name: name, canty: canty })
    .then((doc: any) => {
      res.status(200).json(doc);
    })
    .catch((error: any) => {
      res.status(204).json({ "message": `error ${error}` })
    })
})

medicationRouter.get('/getAll', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  console.log('id', id);
  const collection = db.medication;
  await collection.find({ selector: { idPatient: { $eq: id } } }).exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

export { medicationRouter };