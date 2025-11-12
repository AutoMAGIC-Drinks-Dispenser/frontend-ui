import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';

class ArduinoService extends EventEmitter {
  private serialPort: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private readonly PORT_PATH = '/dev/ttyS0'; // GPIO UART port on Raspberry Pi 4
  private readonly BAUD_RATE = 9600;

  constructor() {
    super();
    this.init();
  }

  private async init() {
    try {
      this.serialPort = new SerialPort({
        path: this.PORT_PATH,
        baudRate: this.BAUD_RATE,
        dataBits: 8,
        parity: 'none',
        stopBits: 1
      });

      this.parser = new ReadlineParser();
      this.serialPort.pipe(this.parser);

      this.serialPort.on('open', () => {
        console.log('UART connection established');
        this.emit('connected');
      });

      this.parser.on('data', (data: string) => {
        const rfidData = data.trim();
        if (rfidData) {
          console.log('Received RFID:', rfidData);
          this.emit('rfid', rfidData);
        }
      });

      this.serialPort.on('error', (error) => {
        console.error('UART error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      console.error('Failed to initialize UART:', error);
      this.emit('error', error);
    }
  }

  public isConnected(): boolean {
    return this.serialPort?.isOpen ?? false;
  }

  /**
   * Send a command to Arduino via UART
   * @param command The command to send (e.g., 'single', 'double')
   */
  public sendCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.serialPort || !this.serialPort.isOpen) {
        reject(new Error('Arduino is not connected'));
        return;
      }

      this.serialPort.write(command + '\n', (error) => {
        if (error) {
          console.error('Error sending command to Arduino:', error);
          reject(error);
        } else {
          console.log(`Sent command to Arduino: ${command}`);
          resolve();
        }
      });
    });
  }
}

export const arduinoService = new ArduinoService();