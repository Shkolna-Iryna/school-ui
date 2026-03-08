import React, { useState, useRef } from "react";
import { IconButton, Box } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

export default function VoiceRecorder({ onSend }) {
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                onSend(blob); // передаємо батьківському компоненту
            };

            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (err) {
            console.error("Помилка доступу до мікрофону:", err);
            alert("Неможливо отримати доступ до мікрофону");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!recording ? (
                <IconButton color="primary" onClick={startRecording}>
                    <MicIcon />
                </IconButton>
            ) : (
                <IconButton color="error" onClick={stopRecording}>
                    <StopIcon />
                </IconButton>
            )}
            {audioURL && (
                <audio
                    controls
                    src={audioURL}
                    style={{ maxWidth: 200, height: "30px" }}
                />
            )}
        </Box>
    );
}