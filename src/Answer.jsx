import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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

export default function Answers() {
  const { taskId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [open, setOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loadingAnswerId, setLoadingAnswerId] = useState(null);

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
        body: JSON.stringify({
          answer_id: answerId,
        }),
      });

      setCorrectAnswer(answerId);
      setLoadingAnswerId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnswerId(null);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      alert("Введіть відповідь!");
      return;
    }

    try {
      await fetchWithAuth("/answers", {
        method: "POST",
        body: JSON.stringify({
          answer: answerText,
          task_id: taskId,
        }),
      });

      setAnswerText("");
      setOpen(false);
      fetchAnswers();
    } catch (error) {
      console.error("Помилка при збереженні:", error);
      alert("Сталася помилка при збереженні");
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
            is_correct,
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

          <IconButton sx={{ color: "black" }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </AppBar>
      <Modal open={open}>
        <>
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              backdropFilter: "blur(3px)",
            }}
          />

          <Box
            sx={{
              position: "fixed",
              width: "500px",
              height: "400px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              borderRadius: "10px",
              maxWidth: 400,
            }}
          >
            <Button
              sx={{ color: "black", marginLeft: "350px" }}
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </Button>
            <Typography
              sx={{
                marginTop: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "25px",
                fontWeight: 700,
              }}
            >
              Дайте відповідь
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <TextField
                multiline
                placeholder="Введіть відповідь"
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                variant="filled"
                sx={{
                  marginTop: "20px",
                  width: "350px",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={handleSubmit}
                sx={{
                  marginTop: "20px",
                  backgroundColor: "black",
                  color: "white",
                }}
              >
                Відправити
              </Button>
            </Box>
          </Box>
        </>
      </Modal>
    </Box>
  );
}
