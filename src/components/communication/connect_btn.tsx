import React from "react";

export const ConnectButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none"
    >
      Connect to Device
    </button>
  );
}