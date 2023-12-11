import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
import { v4 as uuidv4 } from 'uuid';
const addRouter = express.Router();

addRouter.post('/add', async (req: Request, res: Response) => {
  const { firstName, lastName, bloodPressureMax, bloodPressureMin, pulse } = req.body;
  const collection = db.vital_sings;
  try {
    const id = uuidv4();
    const doc = await collection.insert({ id: uuidv4(), firstName: firstName, lastName: lastName, bloodPressureMax: bloodPressureMax, bloodPressureMin: bloodPressureMin, pulse: pulse });
    console.log('id:', id);
    res.status(200).json({ "message": "ok" });
  } catch (error) {
    res.status(204).json({ "message": "error" });
  }
})

addRouter.put('/put', async (req: Request, res: Response) => {
  const { id, firstName:firstName ,lastName:lastName,bloodPressureMax, bloodPressureMin, pulse } = req.body;
  const collection = db.vital_sings;
  let document: RxDocument = await collection.findOne(id).exec();
  if (isRxDocument(document)) {
    document.patch({
      firstName:firstName,
      lastName:lastName,
      bloodPressureMin: bloodPressureMin,
      bloodPressureMax: bloodPressureMax,
      pulse: pulse
    })
  }
  res.status(200).json({ "message": "ok" });
})

addRouter.get('/getOne', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection: RxCollection = db.vital_sings;
  await collection.findOne(id).exec().then((document: RxDocument) => {
    res.status(200).json(document);
  });
})


addRouter.delete('/delete', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection: RxCollection = db.vital_sings;
  await collection.findOne(id).exec().then(async (document: RxDocument) => {
    await document.remove().then((doc) => {
      res.status(200).json(doc);
    })
  });
})


addRouter.get('/getAll', async (req: Request, res: Response) => {
  const collection = db.vital_sings;
  await collection.find().exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

export { addRouter };