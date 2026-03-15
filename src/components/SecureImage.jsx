import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export const UPLOADS_URL = `${API_URL}/uploads`;

export default function SecureImage({ src }) {
    const [img, setImg] = useState(null);

    useEffect(() => {
        const loadImage = async () => {
            const token = localStorage.getItem("access_token");

            const res = await fetch(src, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const blob = await res.blob();

            const url = URL.createObjectURL(blob);

            setImg(url);
        };

        loadImage();
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