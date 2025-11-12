import React, { useState } from "react";
import { SpejlaegPopupModal } from "./dispense_button_modal";
import { sendDataToArduino } from "./communication/serialService";
import { incrementAlltime } from "./communication/api"; 

export const SpejlaegButtonComponent: React.FC = () => {
  const [showPopup, setShowPopup] = useState<"single" | "double" | null>(null);
  const [error, setError] = useState<string>("");

  const handleSingleButtonClick = () => {
    setShowPopup("single");
  };

  const handleDoubleButtonClick = () => {
    setShowPopup("double");
  };

  const handleClosePopup = () => {
    setShowPopup(null);
    setError("");
  };

  const handleStart = async () => {
    if (showPopup) {
      try {
        // Get the logged in user's ID
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          setError('Du skal være logget ind for at bestille');
          return;
        }

        // Increment the alltime counter
        await incrementAlltime(Number(userId));
        
        // If increment was successful, send to Arduino
        sendDataToArduino(showPopup);
        
        // Close the popup
        setShowPopup(null);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Der sket en fejl');
      }
    }
  };

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex space-x-12">
        <button
          onClick={handleSingleButtonClick}
          className="hover:bg-stone-100 focus:outline-none"
        >
          <img
            src="../../src/Images/blub.png"
            alt="Spejlæg"
            className="flex w-52 h-52"
          />
        </button>
        <button
          onClick={handleDoubleButtonClick}
          className="hover:bg-stone-100 focus:outline-none"
        >
          <img
            src="../../src/Images/blub2.png"
            alt="Double Spejlæg"
            className="flex w-52 h-52"
          />
        </button>
      </div>
      {showPopup && (
        <SpejlaegPopupModal 
          onClose={handleClosePopup} 
          onStart={handleStart}
          err={error} // Pass error to modal if you want to display it there
        />
      )}
    </div>
  );
};

export default SpejlaegButtonComponent;