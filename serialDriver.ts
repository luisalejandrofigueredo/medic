import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { RxDocument, isRxDocument } from 'rxdb';
import { db } from "./connection";
const portName1 = 'COM2';
const portName2 = 'COM10';
const port1 = new SerialPort({ path: portName1, baudRate: 9600 });
const port2 = new SerialPort({ path: portName2, baudRate: 9600 },);
const parser1 = port1.pipe(new ReadlineParser({ delimiter: '\n' }));
const parser2 = port2.pipe(new ReadlineParser({ delimiter: '\n' }));
function getPulse(params: string): number {
    if (params.indexOf('pulse') !== -1) {
        const posPulse = params.indexOf('pulse');
        const pulseAtEnd = params.substring(posPulse + 6);
        return +pulseAtEnd
    };
    return -1
}

async function updatePulse(id: string, pulse: number) {
    const collection = db.vital_sings;
    let document: RxDocument = await collection.findOne(id).exec();
    if (isRxDocument(document)) {
        document.patch({
            pulse: pulse,
        })
    }
}


export { port1, port2, parser1, parser2, getPulse,updatePulse }