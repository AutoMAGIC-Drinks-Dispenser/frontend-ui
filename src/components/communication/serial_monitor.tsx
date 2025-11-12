import React, { useState, useEffect, useRef } from 'react';
import { SerialPort } from 'serialport';
import { requestSerialPort, closeSerialPort, getCurrentPort } from './serialService';

interface SerialMessage {
  timestamp: Date;
  direction: 'sent' | 'received';
  data: string;
}

let monitorCallback: ((message: SerialMessage) => void) | null = null;

export const logSerialMessage = (direction: 'sent' | 'received', data: string) => {
  if (monitorCallback) {
    monitorCallback({
      timestamp: new Date(),
      direction,
      data
    });
  }
};

export const SerialMonitor: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const [autoscroll, setAutoscroll] = useState(true);
  const [port, setPort] = useState<SerialPort | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    monitorCallback = (message: SerialMessage) => {
      setMessages(prev => [...prev, message]);
    };

    // Check if already connected
    setPort(getCurrentPort());

    return () => {
      monitorCallback = null;
    };
  }, []);

  useEffect(() => {
    if (autoscroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoscroll]);

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

  const clearMessages = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-800 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Serial Port Monitor</h2>
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${port ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{port ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Arduino Connect/Disconnect Button */}
            {!port ? (
              <button
                onClick={handleConnect}
                className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-medium"
              >
                🔌 Connect to Arduino
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="bg-orange-600 hover:bg-orange-700 px-4 py-1 rounded text-sm font-medium"
              >
                🔌 Disconnect
              </button>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoscroll}
                onChange={(e) => setAutoscroll(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-scroll
            </label>
            <button
              onClick={clearMessages}
              className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-sm"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-zinc-900 p-4 font-mono text-sm">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center mt-10">
              {!port ? (
                <>
                  <p className="mb-2">⚠️ No Arduino connected</p>
                  <p>Click "Connect to Arduino" above to establish connection.</p>
                </>
              ) : (
                <>
                  <p className="mb-2">✓ Arduino connected</p>
                  <p>No messages yet. Send data to Arduino to see it here.</p>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`py-1 px-2 mb-1 rounded ${
                  msg.direction === 'sent'
                    ? 'bg-blue-900 text-blue-100'
                    : 'bg-green-900 text-green-100'
                }`}
              >
                <span className="text-gray-400">[{formatTime(msg.timestamp)}]</span>
                <span className={`ml-2 font-semibold ${
                  msg.direction === 'sent' ? 'text-blue-300' : 'text-green-300'
                }`}>
                  {msg.direction === 'sent' ? '→ SENT' : '← RECEIVED'}
                </span>
                <span className="ml-2">: {msg.data}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Status Bar */}
        <div className="bg-zinc-200 px-4 py-2 rounded-b-lg text-sm text-gray-700 flex justify-between items-center">
          <div>
            Messages: {messages.length} | 
            Sent: {messages.filter(m => m.direction === 'sent').length} | 
            Received: {messages.filter(m => m.direction === 'received').length}
          </div>
          <div className="text-xs text-gray-600">
            Baud Rate: 9600 | Port: {port ? 'ATmega 2560' : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
