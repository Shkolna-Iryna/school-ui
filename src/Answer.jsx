import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import { fetchWithAuth } from "./helpers/api";
import { ListItemButton } from "@mui/material";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { Button, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Fab from "@mui/material/Fab";
import SearchIcon from "@mui/icons-material/Search";
import { Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CircularProgress from "@mui/material/CircularProgress";
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import { UPLOADS_URL } from "./helpers/api";
import TaskImages from "./Images"

export default function Answers() {
  const { taskId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [open, setOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loadingAnswerId, setLoadingAnswerId] = useState(null);
  const editorRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);


  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);

    // Генеруємо прев’ю
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };
  const fetchAnswers = async () => {
    const data = await fetchWithAuth(`/answers?task_id=${taskId}`);
    const correctAnswerId = data.find((i) => i.is_correct)?.id;

    setCorrectAnswer(correctAnswerId);
    setAnswers(data);
  };

  const handleSetCorrectAnswer = async (taskId, answerId) => {
    try {
      setLoadingAnswerId(answerId);

      await fetchWithAuth(`/tasks/${taskId}/correct`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_id: answerId,
        }),
      });

      await fetchAnswers(); // 🔥 ОНОВЛЮЄМО СПИСОК

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnswerId(null);
    }
  };
  const OpenChange = () => {
    setError("");
    setOpen(true);

  };
  const CloseChange = () => {
    setOpen(false);
    setError("");
  }

  useEffect(() => {
    fetchAnswers();
  }, [taskId]);

  const handleSubmit = async () => {
    try {
      const text = editorRef.current?.textContent;

      if (!text.trim()) {
        alert("Контент порожній");
        return;
      }

      setSubmitting(true); // 🔥 старт лоадера

      const modData = await fetchWithAuth("/ai/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (modData?.flagged) {
        setError("Текст не дозволено використовувати");
        setSubmitting(false);
        return;
      }

      const body = new FormData();
      body.append("answer", text);
      body.append("task_id", taskId);
      files.forEach((file) => body.append("photos", file));

      await fetchWithAuth("/answers", {
        method: "POST",
        body,
      });

      await fetchAnswers();

      editorRef.current.innerHTML = "";
      setFiles([]);
      setError("");
      setPreviews([]);
      setOpen(false);

    } catch (err) {
      console.error(err);
      alert("Сталася помилка при збереженні: " + err.message);
    } finally {
      setSubmitting(false); // 🔥 зупинка лоадера
    }
  };


  return (
    <Box>
      <List sx={{ width: "100%" }}>
        {answers.map(
          ({
            id,
            primary,
            secondary,
            person,
            answer,
            task_id,
            user,
            is_correct, image_url = []
          }) => (
            <React.Fragment key={id}>
              <ListItemButton
                sx={{
                  alignItems: "flex-start",
                  borderRadius: 3,
                  mb: 2,
                  p: 2,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    backgroundColor: "#fbfbff",
                    transform: "translateY(-1px)",
                    boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 56, mt: 0.5 }}>
                  <Avatar
                    alt="Profile Picture"
                    src={person}
                    sx={{
                      width: 44,
                      height: 44,
                      border: "2px solid rgba(52,49,219,0.15)",
                    }}
                  />
                </ListItemAvatar>

                <Box sx={{ width: "100%" }}>
                  {/* Ім'я */}
                  <Typography
                    sx={{
                      color: "#3431db",
                      fontFamily: "Roboto",
                      fontWeight: 800,
                      fontSize: 14,
                      mb: 0.25,
                    }}
                  >
                    {user?.name || "Без імені"}
                  </Typography>

                  {/* Текст задачі */}
                  <Typography
                    sx={{
                      fontSize: 14,
                      mb: 1,
                      color: "#111",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}
                  >
                    {answer}

                  </Typography>
                  {image_url?.map((photo, index) => (
                    <img
                      key={index}
                      src={`${UPLOADS_URL}/${photo}`}
                      alt="answer"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginTop: 8
                      }}
                    />
                  ))}

                  {image_url?.length > 0 && (
                    <TaskImages images={image_url} />
                  )}

                  {/* primary/secondary */}
                  <ListItemText
                    primary={primary}
                    secondary={secondary}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#222",
                    }}
                    secondaryTypographyProps={{
                      fontSize: 13,
                      color: "#666",
                    }}
                    sx={{ m: 0 }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 1.5,
                    }}
                  >
                    <Button
                      component={Link}
                      to="/sub"
                      variant="text"
                      sx={{
                        color: "#3431db",
                        fontWeight: 800,
                        textTransform: "none",
                        borderRadius: 2,
                        px: 1.5,
                        "&:hover": {
                          backgroundColor: "rgba(52,49,219,0.08)",
                        },
                      }}
                    >
                      Перейти до завдань →
                    </Button>
                  </Box>
                </Box>
                {correctAnswer === id ? (
                  <FavoriteIcon />
                ) : (
                  <IconButton
                    onClick={() => handleSetCorrectAnswer(task_id, id)}
                    disabled={loadingAnswerId === id}
                  >
                    {loadingAnswerId === id ? (
                      <CircularProgress size={18} />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                )}
              </ListItemButton>
            </React.Fragment>
          )
        )}
      </List>
      <AppBar
        position="fixed"
        sx={{
          top: "auto",
          bottom: 0,
          backgroundColor: "#f8fdfd",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            px: 2,
            height: 64,
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Fab
              onClick={() => setOpen(true)}
              sx={{
                backgroundColor: "black",
                color: "white",
                mt: -4,
              }}
            >
              <AddIcon />
            </Fab>

          </Box>

          <Button component={Link} to={`/generation/${taskId}`}
            sx={{
              backgroundColor: "black",
              color: "white",

            }}>Закріплення</Button>

        </Box>
      </AppBar>
      <Modal open={open} onClose={CloseChange}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            height: 400,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              Дати відповідь
            </Typography>
          </Box>
          <Box sx={{ position: "fixed", top: 2, right: 2 }}>
            <IconButton onClick={CloseChange}>
              <CloseIcon />
            </IconButton>
          </Box>


          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            placeholder="Відповіді"
            sx={{
              minHeight: 150,
              border: "1px solid #ccc",
              backgroundColor: "#f3f2f2",
              p: 1.5,
              outline: "none",
              overflowY: "auto",
              fontSize: 16,
              fontFamily: "Roboto",
              "&:empty:before": {
                content: '"Відповідь"',
                color: "#999",
                fontFamily: "Roboto"

              },
            }}
          />


          {previews.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {previews.map((src, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "relative",
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    border: "1px solid #ccc",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => {
                      // Видаляємо прев’ю за індексом
                      setPreviews((prev) => prev.filter((_, index) => index !== i));
                      // Якщо зберігаєш файли окремо, видали і їх з масиву files (якщо є)
                      setFiles((prev) => prev.filter((_, index) => index !== i));
                    }}
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "rgba(255,255,255,0.7)",
                      "&:hover": { bgcolor: "rgba(255,0,0,0.8)", color: "white" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* Actions */}

          <Box sx={{ position: "relative" }}>
            <input
              type="file"
              id="upload-photo"
              hidden
              multiple
              accept="image/*"
              onChange={handleFiles}
            />
            <Box sx={{ position: "absolute", right: 0 }}>
              <IconButton component="label" htmlFor="upload-photo" sx={{ color: "black" }}>
                <AddToPhotosIcon />
              </IconButton></Box>
          </Box>

          <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center", mt: -2
          }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                bgcolor: "black",
                borderRadius: 1,
                minWidth: 140,
                "&:hover": { bgcolor: "#222" },
              }}
            >
              {submitting ? (
                <CircularProgress size={22} sx={{ color: "white" }} />
              ) : (
                "Відправити"
              )}
            </Button>

          </Box>


          {/* Errors */}
          {error && (
            <Typography color="error" fontSize={14}>
              {error}
            </Typography>
          )}
        </Box>
      </Modal>

    </Box>
  );
}
