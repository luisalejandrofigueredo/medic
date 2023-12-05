import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
const medicationRouter = express.Router();

medicationRouter.delete('/delete', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection = db.medication;
  await collection.findOne(id).exec().then(async (document: RxDocument) => {
    await document.remove().then(async (doc) => {
      console.log('idPatient',doc.get("idPatient"))
      await collection.renumber(doc.get("idPatient")).then((documents: RxDocument[]) => {
        res.status(200).json(doc);
      }).catch((_error: any) => { console.log('error en renumber') });
    }).catch((error) => console.log('error'));
  });
})


medicationRouter.post('/add', async (req: Request, res: Response) => {
  const { idPatient, name, canty,type,units } = req.body;
  const collection = db.medication;
  collection.insertWithUniqueKeyAndItemNumber({ idPatient: idPatient, name: name, canty: canty,type:type,units:units })
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
  await collection.find({ selector: { idPatient: { $eq: id } },sort:[ {item:'asc'}] }).exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

export { medicationRouter };