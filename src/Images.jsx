import React, { useState } from "react";
import { Box, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UPLOADS_URL } from "./helpers/api";
import SecureImage from "./components/SecureImage"

export default function TaskImages({ images }) {
  const [open, setOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(null);

  const handleOpen = (img) => {
    setCurrentImg(img);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentImg(null);
  };

  return (
    <>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
        {images.map((url, i) => (
          <Box
            key={i}
            sx={{
              width: 50,
              height: 50,
              border: "1px solid gray",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => handleOpen(url)}
          >
            <SecureImage src={`${UPLOADS_URL}/${url}`} />
          </Box>
        ))}
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "black",
            width: "90%",
            height: "90%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            outline: "none",
          }}
        >
          {currentImg && (
            <>
              {/* <img
                src={`${UPLOADS_URL}/${currentImg}`}
                alt="full-screen"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              /> */}
              66666666666666
              <SecureImage src={`${UPLOADS_URL}/${currentImg}`} />
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "white",
                }}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}

