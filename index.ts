import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import * as path from 'path';
import { Server, Socket } from 'socket.io';
import { RxDocument, createRxDatabase } from 'rxdb';
import cors from "cors";
import {
  getRxStorageMemory
} from 'rxdb/plugins/storage-memory';
import { setDB, db } from "./connection";
import { addRouter } from "./add"


const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/emergency', addRouter);
app.get('/', (req, res) => {
  res.send('emergency is up');
});


// Start the server
(async () => {
  const setDb = await setDB();
  db.vitalSings.$.subscribe((changeEvent: RxDocument) => {
    io.emit('dataChange', changeEvent);
  });
  db.vitalSings.insert$.subscribe((insertEvent: RxDocument) => io.emit('insertRecord', insertEvent));
  db.vitalSings.update$.subscribe((updateEvent: RxDocument) => io.emit('updateRecord', updateEvent));
  db.vitalSings.remove$.subscribe((removeEvent: RxDocument) => io.emit('deleteRecord', removeEvent));
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
export { db };
