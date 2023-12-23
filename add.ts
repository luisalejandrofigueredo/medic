import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
import { v4 as uuidv4 } from 'uuid';
const emergenRouter = express.Router();

emergenRouter.post('/add', async (req: Request, res: Response) => {
  let { firstName, lastName, bloodPressureMax, bloodPressureMin, pulse, oxygen } = req.body;
  firstName=decodeURI(firstName);
  lastName=decodeURI(lastName);
  const collection = db.vital_sings;
  try {
    const id = uuidv4();
    const doc = await collection.insert({ id: uuidv4(), firstName: firstName, lastName: lastName, bloodPressureMax: bloodPressureMax, bloodPressureMin: bloodPressureMin, pulse: pulse, oxygen:oxygen });
    console.log('id:', id);
    res.status(200).json({ "message": "ok" });
  } catch (error) {
    res.status(204).json({ "message": "error" });
  }
})

emergenRouter.put('/put', async (req: Request, res: Response) => {
  let  { id, firstName:firstName ,lastName:lastName,bloodPressureMax, bloodPressureMin, pulse,oxygen } = req.body;
  firstName=decodeURI(firstName);
  lastName=decodeURI(lastName);
  const collection = db.vital_sings;
  let document: RxDocument = await collection.findOne(id).exec();
  if (isRxDocument(document)) {
    document.patch({
      firstName:firstName,
      lastName:lastName,
      bloodPressureMin: bloodPressureMin,
      bloodPressureMax: bloodPressureMax,
      pulse: pulse,
      oxygen:oxygen
    })
  }
  res.status(200).json({ "message": "ok" });
})

emergenRouter.get('/getOne', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection: RxCollection = db.vital_sings;
  await collection.findOne(id).exec().then((document: RxDocument) => {
    res.status(200).json(document);
  });
})


emergenRouter.delete('/delete', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection: RxCollection = db.vital_sings;
  await collection.findOne(id).exec().then(async (document: RxDocument) => {
    await document.remove().then((doc) => {
      res.status(200).json(doc);
    })
  });
})


emergenRouter.get('/getAll', async (req: Request, res: Response) => {
  const collection = db.vital_sings;
  await collection.find().exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

export { emergenRouter };