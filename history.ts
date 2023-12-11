import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
const historyRouter = express.Router();

historyRouter.delete('/delete', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection = db.history;
  await collection.findOne(id).exec().then(async (document: RxDocument) => {
    await document.remove().then(async (doc) => {
      console.log('idPatient',doc.get("idPatient"))
      await collection.renumber(doc.get("idPatient")).then((documents: RxDocument[]) => {
        res.status(200).json(doc);
      }).catch((_error: any) => { console.log('error en renumber') });
    }).catch((error) => console.log('error'));
  });
})


historyRouter.post('/add', async (req: Request, res: Response) => {
  const { idPatient,date,history  } = req.body;
  const collection = db.history;
  collection.insertWithUniqueKeyAndItemNumber({ idPatient: idPatient, date:date,history:history })
    .then((doc: any) => {
      res.status(200).json(doc);
    })
    .catch((error: any) => {
      res.status(204).json({ "message": `error ${error}` })
    })
})

historyRouter.get('/getAll', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  console.log('get all history id', id);
  const collection = db.history;
  await collection.find({ selector: { idPatient: { $eq: id } },sort:[ {item:'asc'}] }).exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

historyRouter.get('/getOne', async (req: Request, res: Response) => {
    const id: string = req.query.id as string;
    const collection: RxCollection = db.history;
    await collection.findOne(id).exec().then((document: RxDocument) => {
      res.status(200).json(document);
    });
  })

  historyRouter.put('/put', async (req: Request, res: Response) => {
    const { id, date, history } = req.body;
    const collection = db.history;
    let document: RxDocument = await collection.findOne(id).exec();
    if (isRxDocument(document)) {
      document.patch({
        date:date,
        history:history
      })
    }
    res.status(200).json({ "message": "ok" });
  })
  

export { historyRouter };