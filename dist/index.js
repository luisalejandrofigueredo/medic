"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const path = __importStar(require("path"));
const socket_io_1 = require("socket.io");
const rxdb_1 = require("rxdb");
const dev_mode_1 = require("rxdb/plugins/dev-mode");
const update_1 = require("rxdb/plugins/update");
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./connection");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return connection_1.db; } });
const vital_sings_1 = require("./vital_sings");
const medication_1 = require("./medication");
const history_1 = require("./history");
const chat_1 = require("./chat");
const message_1 = require("./message");
const query_builder_1 = require("rxdb/plugins/query-builder");
const auth_1 = require("firebase/auth");
const admin = __importStar(require("firebase-admin"));
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
require("firebase/auth");
const fs = require('fs/promises');
const portName1 = 'COM2';
const portName2 = 'COM10';
const port1 = new serialport_1.SerialPort({ path: portName1, baudRate: 9600 });
const port2 = new serialport_1.SerialPort({ path: portName2, baudRate: 9600 });
const parser1 = port1.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\n' }));
const parser2 = port2.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\n' }));
const macaddress = require('macaddress');
if (process.env.NODE_ENV === 'development') {
    (0, rxdb_1.addRxPlugin)(dev_mode_1.RxDBDevModePlugin);
}
(0, rxdb_1.addRxPlugin)(update_1.RxDBUpdatePlugin);
(0, rxdb_1.addRxPlugin)(query_builder_1.RxDBQueryBuilderPlugin);
const app = (0, express_1.default)();
let allowedMACs = [];
const serviceAccount = require('./serviceAccountKey.json');
app.use((req, res, next) => {
    // Obtener la dirección MAC del cliente
    macaddress.one((err, mac) => {
        console.log('mac:', mac);
        if (err) {
            console.error(err);
            // Puedes decidir rechazar la conexión si hay un error al obtener la MAC
            console.log('Error al obtener la dirección MAC');
            res.status(500).send('Error al obtener la dirección MAC');
        }
        else {
            // Verificar si la dirección MAC está permitida   
            if (allowedMACs.find((macaddr) => { return mac === macaddr.macaddress; }) !== undefined) {
                // Continuar con la solicitud si la MAC está permitida
                next();
            }
            else {
                // Rechazar la conexión si la MAC no está permitida
                console.log('Acceso denegado');
                res.status(403).send('Acceso denegado');
            }
        }
    });
});
const authenticateUser = async (req, res, next) => {
    let idToken = req.headers.authorization;
    if (!idToken) {
        console.log('---sin token----');
        return res.status(403).send('Unauthorized');
    }
    else {
        try {
            idToken = idToken.slice(7);
            await admin.auth().verifyIdToken(idToken);
            next();
        }
        catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('error', errorMessage);
            const credential = auth_1.GoogleAuthProvider.credentialFromError(error);
            // ...
            return res.status(403).send('Acceso denegado');
        }
    }
};
// socket server
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4200",
        credentials: true
    }
});
//serial module
parser1.on('data', (line) => {
    console.log('Mensaje recibido en puerto 1:', line);
    io.emit('newSerialMessagePort1', line);
});
// Cuando se recibe un mensaje en el puerto 2, reenviar al puerto 1
parser2.on('data', (line) => {
    console.log('Mensaje recibido en puerto 2:', line);
    io.emit('newSerialMessagePort2', line);
});
//end serial module
const PORT = process.env.PORT || 3000;
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: '*' }));
app.use('/emergency', authenticateUser, vital_sings_1.vital_signRouter);
app.use('/medication', authenticateUser, medication_1.medicationRouter);
app.use('/history', authenticateUser, history_1.historyRouter);
app.use('/chat', authenticateUser, chat_1.chatRouter);
app.use('/message', authenticateUser, message_1.messageRouter);
app.get('/', authenticateUser, (req, res) => {
    res.status(403).send('Server is up');
});
// Start the server
(async () => {
    try {
        const appFirebaseAuth = admin.initializeApp(serviceAccount);
    }
    catch (error) {
        console.log('error', error);
    }
    const setDb = await (0, connection_1.setDB)();
    fs.readFile('macaddress.json', 'utf8')
        .then((data) => {
        allowedMACs = JSON.parse(data).address;
    })
        .catch((_error) => {
        // Do something if error 
    });
    connection_1.db.vital_sings.$.subscribe((changeEvent) => {
        io.emit('dataChange', changeEvent);
    });
    port1.write('Hola desde el puerto 1!\n');
    connection_1.db.vital_sings.insert$.subscribe((insertEvent) => io.emit('insertRecord', insertEvent));
    connection_1.db.vital_sings.update$.subscribe((updateEvent) => io.emit('updateRecord', updateEvent));
    connection_1.db.vital_sings.remove$.subscribe((removeEvent) => io.emit('deleteRecord', removeEvent));
    connection_1.db.message.insert$.subscribe((newChatEvent) => io.emit('newChat', newChatEvent));
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
