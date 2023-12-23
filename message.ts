import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument, isRxQuery } from "rxdb";
const messageRouter = express.Router();

messageRouter.post('/add', async (req: Request, res: Response) => {
  const { hour, from, to, message } = req.body;
  const collection = db.message;
  collection.insertMessage(hour, from, to, message)
    .then((doc: RxDocument) => {
      res.status(200).json(doc);
    })
    .catch((error: any) => {
      res.status(204).json({ "message": `error ${error}` })
    })
})

messageRouter.get('/getAll', async (req: Request, res: Response) => {
  const collection = db.message;
  await collection.find().exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

messageRouter.get('/getFromTo', async (req: Request, res: Response) => {
  const id: string = req.query.id as string;
  const collection = db.message;
  const query = await collection.find({
    selector: { $or: [{ to: id }, { from: id }] },
    sort: [{ hour: 'desc' }]
  });
  await query.exec().then((documents: RxDocument[]) => {
    res.status(200).json(documents);
  });
})

messageRouter.get('/getFromToMessages', async (req: Request, res: Response) => {
  const from: string = req.query.from as string;
  const to: string = req.query.to as string;
  const collection = db.message;
  console.log('from',from);
  console.log('to',to);
  const query = await collection.find({
    selector: {
      $or: [{ to: to }, { from: from }, { to: from }, { from: to }],
      sort: [{ hour: 'desc' }]
  }})
  console.log('is query ',isRxQuery(query))
  try {
    const result=await query.exec();
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error)
  }
})

export { messageRouter };