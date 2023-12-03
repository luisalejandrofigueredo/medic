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
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./connection");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return connection_1.db; } });
const add_1 = require("./add");
const medication_1 = require("./medication");
(0, rxdb_1.addRxPlugin)(dev_mode_1.RxDBDevModePlugin);
const app = (0, express_1.default)();
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4200",
        credentials: true
    }
});
const PORT = process.env.PORT || 3000;
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: '*' }));
app.use('/emergency', add_1.addRouter);
app.use('/medication', medication_1.medicationRouter);
app.get('/', (req, res) => {
    res.send('emergency is up');
});
// Start the server
(async () => {
    const setDb = await (0, connection_1.setDB)();
    connection_1.db.vital_sings.$.subscribe((changeEvent) => {
        io.emit('dataChange', changeEvent);
    });
    connection_1.db.vital_sings.insert$.subscribe((insertEvent) => io.emit('insertRecord', insertEvent));
    connection_1.db.vital_sings.update$.subscribe((updateEvent) => io.emit('updateRecord', updateEvent));
    connection_1.db.vital_sings.remove$.subscribe((removeEvent) => io.emit('deleteRecord', removeEvent));
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
