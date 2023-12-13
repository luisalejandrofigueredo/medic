import express, { Express, Request, Response, json } from 'express';
import * as http from 'http';
import * as path from 'path';
import { Server, Socket } from 'socket.io';
import { RxDocument, createRxDatabase } from 'rxdb';
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import cors from "cors";
import {
  getRxStorageMemory
} from 'rxdb/plugins/storage-memory';
import { setDB, db } from "./connection";
import { addRouter } from "./add";
import { medicationRouter } from "./medication";
import { historyRouter } from "./history";
const fs = require('fs/promises');


const macaddress = require('macaddress');

if (process.env.NODE_ENV==='development'){
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBUpdatePlugin);
const app: Express = express();
let allowedMACs:{macaddress:string}[]=[];

app.use((req:Request, res:Response, next) => {
  // Obtener la dirección MAC del cliente
  macaddress.one((err:any, mac:string) => {
    console.log('mac:',mac)
    if (err) {
      console.error(err);
      // Puedes decidir rechazar la conexión si hay un error al obtener la MAC
      console.log('Error al obtener la dirección MAC')
      res.status(500).send('Error al obtener la dirección MAC');
    } else {
      // Verificar si la dirección MAC está permitida
     
      if (allowedMACs.find((macaddr)=>{ return mac=== macaddr.macaddress})!==undefined) {
        // Continuar con la solicitud si la MAC está permitida
        next();
      } else {
        // Rechazar la conexión si la MAC no está permitida
        console.log('Acceso denegado')
        res.status(403).send('Acceso denegado');
      }
    }
  });
});



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
app.use('/medication', medicationRouter);
app.use('/history', historyRouter);
app.get('/', (req, res) => {
  res.send('emergency is up');
});


// Start the server
(async () => {
  const setDb = await setDB();
  fs.readFile('macaddress.json','utf8')
  .then((data: any) => {
    allowedMACs=JSON.parse(data).address;
  })
  .catch((_error: any) => {
    // Do something if error 
  });
  db.vital_sings.$.subscribe((changeEvent: RxDocument) => {
    io.emit('dataChange', changeEvent);
  });
  db.vital_sings.insert$.subscribe((insertEvent: RxDocument) => io.emit('insertRecord', insertEvent));
  db.vital_sings.update$.subscribe((updateEvent: RxDocument) => io.emit('updateRecord', updateEvent));
  db.vital_sings.remove$.subscribe((removeEvent: RxDocument) => io.emit('deleteRecord', removeEvent));
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
export { db };
