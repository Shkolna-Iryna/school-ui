import { useEffect, useState } from "react";
import { fetchBlob } from "../helpers/api";

export default function SecureAudio({ src }) {
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        let objectUrl;

        const loadAudio = async () => {
            const blob = await fetchBlob(src);
            objectUrl = URL.createObjectURL(blob);
            setAudio(objectUrl);
        };

        loadAudio();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    if (!audio) return null;

    return <audio controls preload="metadata" src={audio} />;
}