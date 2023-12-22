import express, { Request, Response } from 'express';
import { db } from "./connection";
import { RxCollection, RxDocument, isRxDocument } from "rxdb";
const chatRouter = express.Router();
chatRouter.post('/add', async (req: Request, res: Response) => {
    const { uid, name, avatar } = req.body;
    const collection = db.group;
    collection.insertUser(uid, name, avatar)
        .then((doc: any) => {
            res.status(200).json(doc);
        })
        .catch((error: any) => {
            res.status(204).json({ "message": `error ${error}` })
        })
});

chatRouter.get('/getAll', async (req: Request, res: Response) => {
    const collection = db.group;
    await collection.find().exec().then((documents: RxDocument[]) => {
        res.status(200).json(documents);
    });
})

chatRouter.delete('/delete', async (req: Request, res: Response) => {
    const id: string = req.query.id as string;
    const collection = db.group;
    await collection.findOne(id).exec().then(async (document: RxDocument) => {
        if (isRxDocument(document)) {
            await document.remove().then(async (doc) => {
                res.status(200).json(doc);
            }).catch((error) => console.log('error'));
        } else {
            res.status(204).json({ "message": ' error' });
        }
    });
})

chatRouter.get('/getOne', async (req: Request, res: Response) => {
    const id: string = req.query.id as string;
    const collection: RxCollection = db.group;
    await collection.findOne(id).exec().then((document: RxDocument) => {
        res.status(200).json(document);
    });
});

export { chatRouter };