import React from "react";

const AlertDialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

const AlertDialogHeader = ({ children }) => {
  return <div className="border-b pb-2 mb-2">{children}</div>;
};

const AlertDialogTitle = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

const AlertDialogDescription = ({ children }) => {
  return <p className="text-sm text-gray-600">{children}</p>;
};

const AlertDialogFooter = ({ children }) => {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
};

const AlertDialogCancel = ({ onClick, children }) => {
  return (
    <button
      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const AlertDialogAction = ({ onClick, children }) => {
  return (
    <button
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
