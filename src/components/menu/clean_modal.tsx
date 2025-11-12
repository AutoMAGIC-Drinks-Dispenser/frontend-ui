import React, { useState } from "react";
import { sendDataToArduino } from "../communication/serialService";
import { PopupProps } from "../dispense_button_modal";


export const CleaningPopupModal: React.FC<PopupProps> = ({
  onClose,
  onStart,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Rengør system</h2>
        <div className="flex justify-around mt-8">
          <button
            onClick={onStart}
            className="bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 focus:outline-none p-2"
          >
            Start
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none p-2"
          >
            Annullér
          </button>
        </div>
        <h3 className="mt-3">Denne handling skyller systemet igennem i 5 sekunder</h3>
        <h4>Sørg for at pumpen er tilsluttet en vand beholder</h4>
      </div>
    </div>
  );
};

export const CleaningButton: React.FC = () => {
  const [showPopup, setShowPopup] = useState<"clean" | null>(null);
  const [error, setError] = useState<string>("");

  const handleCleanClick = () => {
    setShowPopup("clean");
  };

  const handleClosePopup = () => {
    setShowPopup(null);
    setError("");
  };

  const handleStart = async () => {
    if (showPopup) {
      try {
        sendDataToArduino(showPopup);
        setShowPopup(null);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Der sket en fejl');
      }
    }
  };

  return (
    <div>
      <button
        className="bg-zinc-800 text-xs text-white px-6 py-2 rounded-md hover:bg-zinc-950 focus:outline-none w-32 h-12"
        onClick={handleCleanClick}
      >
        Rengør System
      </button>
      {showPopup && (
        <CleaningPopupModal 
          onClose={handleClosePopup} 
          onStart={handleStart} 
          err={error}
        />
      )}
    </div>
  );
};
