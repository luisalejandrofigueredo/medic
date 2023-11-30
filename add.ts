import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";

const addRouter = express.Router();

addRouter.post('/add', async (req: Request, res: Response) => {
  const { id, firstName,lastName,bloodPressureMax, bloodPressureMin, pulse } = req.body;
  const collection = db.vitalSings;
  const doc = await collection.insert({ id: id,firstName:firstName ,lastName:lastName,bloodPressureMax: bloodPressureMax, bloodPressureMin: bloodPressureMin, pulse: pulse });
  res.status(200).json({ "message": "ok" });
})

addRouter.put('/put', async (req: Request, res: Response) => {
  const { id, bloodPressureMax, bloodPressureMin, pulse } = req.body;
  const collection = db.vitalSings;
  let document: RxDocument = await collection.findOne(id).exec();
  if (isRxDocument(document)) {
    document.patch({
      bloodPressureMin: bloodPressureMin,
      bloodPressureMax: bloodPressureMax,
      pulse: pulse
    }) 
  }
  res.status(200).json({ "message": "ok" });
})

addRouter.get('/getOne', async (req: Request, res: Response) => {
  const id:string=req.query.id as string;
  const collection:RxCollection = db.vitalSings;
  await collection.findOne(id).exec().then((document: RxDocument) => {
    res.status(200).json(document);
  });
})


addRouter.delete('/delete', async (req: Request, res: Response) => {
  const id:string=req.query.id as string;
  const collection:RxCollection = db.vitalSings;
  await collection.findOne(id).exec().then(async (document: RxDocument) => {
    await document.remove().then((doc)=>{
      res.status(200).json(doc);
    })
  });
})


addRouter.get('/getAll', async (req: Request, res: Response) => {
  const collection = db.vitalSings;
  await collection.find().exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

export { addRouter };