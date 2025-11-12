import React, { useEffect, useState } from 'react';
import { SpejlaegButtonComponent } from './dispense_button';
import { HeaderComponent } from './header.tsx';
import { RefillPremixModal, RefillPostmixModal } from './menu/refill_modal';
import { SerialMonitor } from './communication/serial_monitor';

export const MainMenu: React.FC = () => {
  const [showRefillPostmix, setShowRefillPostmix] = useState(false);
  const [showRefillPremix, setShowRefillPremix] = useState(false);
  const [showSerialMonitor, setShowSerialMonitor] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server to listen for refill events
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'rfid') {
          const rfidData = message.data;
          console.log('Received RFID in MainMenu:', rfidData);

          if (rfidData === 'refill faxe') {
            setShowRefillPostmix(true);
          } else if (rfidData === 'refill mix') {
            setShowRefillPremix(true);
          }
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <div>
        <HeaderComponent />
      </div>
      
      {/* Serial Monitor Toggle Button - Fixed position bottom right */}
      <button
        onClick={() => setShowSerialMonitor(true)}
        className="fixed bottom-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-zinc-700 text-sm z-40"
        title="Open Serial Monitor"
      >
        📊 Serial Monitor
      </button>

      <SpejlaegButtonComponent />

      {/* Modals */}
      <RefillPostmixModal
        showModal={showRefillPostmix}
        onClose={() => setShowRefillPostmix(false)}
      />
      <RefillPremixModal
        showModal={showRefillPremix}
        onClose={() => setShowRefillPremix(false)}
      />
      
      {/* Serial Monitor */}
      <SerialMonitor
        isOpen={showSerialMonitor}
        onClose={() => setShowSerialMonitor(false)}
      />
    </div>
  );
};
