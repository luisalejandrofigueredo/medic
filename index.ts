import express, { Express, Request, Response, NextFunction } from 'express';
import * as http from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import { RxDocument } from 'rxdb';
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import cors from "cors";
import { setDB, db } from "./connection";
import { vital_signRouter } from "./vital_sings";
import { medicationRouter } from "./medication";
import { historyRouter } from "./history";
import { chatRouter } from "./chat";
import { messageRouter } from "./message";
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { GoogleAuthProvider, User } from "firebase/auth";
import * as admin from 'firebase-admin';
import { port1,port2,parser1,parser2,getPulse } from "./serialDriver";
import 'firebase/auth';


const fs = require('fs/promises');


const macaddress = require('macaddress');
if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
const app: Express = express();
let allowedMACs: { macaddress: string }[] = [];
const serviceAccount = require('./serviceAccountKey.json');

interface ExtendedRequest extends express.Request {
  user?: User;
}

app.use((req: Request, res: Response, next) => {
  // Obtener la dirección MAC del cliente
  macaddress.one((err: any, mac: string) => {
    console.log('mac:', mac)
    if (err) {
      console.error(err);
      // Puedes decidir rechazar la conexión si hay un error al obtener la MAC
      console.log('Error al obtener la dirección MAC')
      res.status(500).send('Error al obtener la dirección MAC');
    } else {
      // Verificar si la dirección MAC está permitida   
      if (allowedMACs.find((macaddr) => { return mac === macaddr.macaddress }) !== undefined) {
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

const authenticateUser = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  let idToken = req.headers.authorization

  if (!idToken) {
    console.log('---sin token----');
    return res.status(403).send('Unauthorized');
  }
  else {
    try {
      idToken = idToken.slice(7);
      await admin.auth().verifyIdToken(idToken!)
      next();
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('error', errorMessage)
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
      return res.status(403).send('Acceso denegado');
    }
  }
}
// socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    credentials: true
  }
});

//serial module
parser1.on('data', (line: string) => {
  console.log('Mensaje recibido en puerto 1:', line);
  if (getPulse(line)!==-1){
    
  }
  io.emit('newSerialMessagePort1', line);
});

// Cuando se recibe un mensaje en el puerto 2, reenviar al puerto 1
parser2.on('data', (line: string) => {
  console.log('Mensaje recibido en puerto 2:', line);
  io.emit('newSerialMessagePort2', line);
});

//end serial module



const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/emergency', authenticateUser, vital_signRouter);
app.use('/medication', authenticateUser, medicationRouter);
app.use('/history', authenticateUser, historyRouter);
app.use('/chat', authenticateUser, chatRouter);
app.use('/message', authenticateUser, messageRouter);
app.get('/', authenticateUser, (req: ExtendedRequest, res) => {
  res.status(403).send('Server is up');
});

// Start the server
(async () => {
  try {
    const appFirebaseAuth = admin.initializeApp(serviceAccount);
  } catch (error) {
    console.log('error', error)
  }
  const setDb = await setDB();
  fs.readFile('macaddress.json', 'utf8')
    .then((data: any) => {
      allowedMACs = JSON.parse(data).address;
    })
    .catch((_error: any) => {
      // Do something if error 
    });
  db.vital_sings.$.subscribe((changeEvent: RxDocument) => {
    io.emit('dataChange', changeEvent);
  });
  port1.write('Hola desde el puerto 1!\n');
  db.vital_sings.insert$.subscribe((insertEvent: RxDocument) => io.emit('insertRecord', insertEvent));
  db.vital_sings.update$.subscribe((updateEvent: RxDocument) => io.emit('updateRecord', updateEvent));
  db.vital_sings.remove$.subscribe((removeEvent: RxDocument) => io.emit('deleteRecord', removeEvent));
  db.message.insert$.subscribe((newChatEvent: RxDocument) => io.emit('newChat', newChatEvent));
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
export { db };
