import React from "react";
import { toast } from "react-toastify";
// import "../App.css";

export function confirmToast({ message, onConfirm, onCancel }) {
  const toastId = toast.info(
    ({ closeToast }) => (
      <div>
        <p>{message}</p>
        <div style={{display:"flex"}}>
          <button
            onClick={() => {
              onConfirm?.(); // fonksiyon varsa çağır
              toast.dismiss(toastId);
            }}
            className="toastYesBtn"
          >
            Evet
          </button>
          <button
            onClick={() => {
              onCancel?.(); // iptal fonksiyonu varsa çağır
              toast.dismiss(toastId);
            }}
            className="toastNoBtn"
          >
            İptal
          </button>
        </div>
      </div>
    ),
    {
      autoClose: true,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
    }
  );
}
