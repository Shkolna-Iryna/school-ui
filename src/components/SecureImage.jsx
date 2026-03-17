import { useEffect, useState } from "react";
import { fetchBlob } from "../helpers/api";

export default function SecureImage({ src }) {
    const [img, setImg] = useState(null);

    useEffect(() => {
        let objectUrl;

        const loadImage = async () => {
            const blob = await fetchBlob(src);
            objectUrl = URL.createObjectURL(blob);
            setImg(objectUrl);
        };

        loadImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    if (!img) return null;

    return (
        <img
            src={img}
            alt="secure"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
    );
}