import { SerialPort } from "serialport";
import { logSerialMessage } from "./serial_monitor";

// Global state for serial connection
let globalWriter: WritableStreamDefaultWriter<string> | null = null;
let globalReader: ReadableStreamDefaultReader<string> | null = null;
let currentPort: SerialPort | null = null;

/**
 * Send data to Arduino via serial port
 */
export const sendDataToArduino = async (data: string): Promise<void> => {
  if (!globalWriter) {
    console.error("No serial writer available. Connect to the Arduino first.");
    return;
  }

  try {
    await globalWriter.write(data + "\n");
    console.log(`Sent to Arduino: ${data}`);
    logSerialMessage('sent', data);
  } catch (err) {
    console.error("Failed to write to Arduino:", err);
    throw err;
  }
};

/**
 * Read data from Arduino continuously
 */
const readFromArduino = async (): Promise<void> => {
  if (!globalReader) return;

  try {
    while (true) {
      const { value, done } = await globalReader.read();
      if (done) break;
      
      if (value) {
        const lines = value.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed) {
            console.log(`Received from Arduino: ${trimmed}`);
            logSerialMessage('received', trimmed);
          }
        });
      }
    }
  } catch (err) {
    console.error("Error reading from Arduino:", err);
  }
};

/**
 * Request and open a serial port connection
 */
export const requestSerialPort = async (): Promise<SerialPort | null> => {
  try {
    const newPort = await (
      navigator as unknown as {
        serial: { requestPort: () => Promise<SerialPort> };
      }
    ).serial.requestPort();
    
    await (newPort as SerialPort).open({ baudRate: 9600 });
    currentPort = newPort;

    // Setup writer (for sending data to Arduino)
    const textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(
      newPort.writable as unknown as WritableStream<Uint8Array>
    );
    globalWriter = textEncoder.writable.getWriter();

    // Setup reader (for receiving data from Arduino)
    const textDecoder = new TextDecoderStream();
    (newPort.readable as unknown as ReadableStream<Uint8Array>).pipeTo(
      textDecoder.writable
    );
    globalReader = textDecoder.readable.getReader();

    // Start reading from Arduino
    readFromArduino();

    console.log("Serial port opened successfully!");
    return newPort;
  } catch (err) {
    console.error("Failed to open serial port:", err);
    return null;
  }
};

/**
 * Close the serial port connection
 */
export const closeSerialPort = async (): Promise<void> => {
  try {
    if (globalReader) {
      await globalReader.cancel();
      globalReader = null;
    }
    if (globalWriter) {
      await globalWriter.close();
      globalWriter = null;
    }
    if (currentPort) {
      await (currentPort as SerialPort).close();
      currentPort = null;
    }
    console.log("Serial port closed.");
  } catch (err) {
    console.error("Failed to close serial port:", err);
    throw err;
  }
};

/**
 * Check if serial port is currently connected
 */
export const isSerialConnected = (): boolean => {
  return currentPort !== null && globalWriter !== null;
};

/**
 * Get the current serial port instance
 */
export const getCurrentPort = (): SerialPort | null => {
  return currentPort;
};
