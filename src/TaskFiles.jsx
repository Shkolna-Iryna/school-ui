import React, { useState, useRef } from "react";

export default function VoiceRecorder({ onSend }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onSend(blob); // передаємо батьківському компоненту
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      style={{
        border: "none",
        backgroundColor: recording ? "red" : "green",
        color: "white",
        borderRadius: "50%",
        width: 40,
        height: 40,
        cursor: "pointer",
      }}
      title={recording ? "Зупинити запис" : "Записати голос"}
    />
  );
}