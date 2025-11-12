import { useState } from "react";
import { SerialPort } from "serialport";
import { requestSerialPort, closeSerialPort } from "./serialService";

export const WebSerialCommunication: React.FC = () => {
  const [port, setPort] = useState<SerialPort | null>(null);

  const handleConnect = async () => {
    const newPort = await requestSerialPort();
    if (newPort) {
      setPort(newPort);
    }
  };

  const handleDisconnect = async () => {
    await closeSerialPort();
    setPort(null);
  };

  return (
    <div>
      {!port ? (
        <button
          className="bg-zinc-800 text-xs text-white px-6 py-2 rounded-md hover:bg-zinc-950 focus:outline-none w-32 h-12"
          onClick={handleConnect}
        >
          Connect to Arduino
        </button>
      ) : (
        <button
          className="bg-zinc-800 text-xs text-white px-6 py-2 rounded-md hover:bg-zinc-950 focus:outline-none w-32 h-12"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      )}
    </div>
  );
};