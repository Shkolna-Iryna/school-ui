import React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { fetchWithAuth } from "./helpers/api";
import TabPanel from "./TabPanel";
import { AppBar } from "@mui/material";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { Modal, Box, Grid, TextField, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import SendIcon from "@mui/icons-material/Send";

import VoiceRecorder from "./Voices";
import { getCurrentUser } from "./helpers";

export default function ColorTabs() {
  const editorRef = useRef(null);
  const [subjects, setSubjects] = useState([]);
  const [value, setValue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [blur, setBlur] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [testResult, setTestResult] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voiceFiles, setVoiceFiles] = useState([]);
  const [voicePreviews, setVoicePreviews] = useState([]);
  const currentUser = getCurrentUser();

  const canEditSubject = ["teacher", "admin"].includes(currentUser?.role);


  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };
  const handleVoiceFiles = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVoiceFiles([file]);

    const reader = new FileReader();
    reader.onload = () => {
      setVoicePreviews([reader.result]);
    };
    reader.readAsDataURL(file);
  };

  const OpenChange = () => {
    setError("");
    setOpen(true);
  };
  const CloseChange = () => {
    setOpen(false);
    setError("");
    setFiles([]);
    setPreviews([]);
    setVoiceFiles([]);
    if (editorRef.current) editorRef.current.innerHTML = ""; // очищаємо текст
  };

  useEffect(() => {
    let cancelled = false;

    const loadSubjects = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchWithAuth("/subjects");
        const arr = Array.isArray(data) ? data : [];
        const safe = arr.filter((s) => s?.id != null);
        console.log("safe", safe);

        if (!cancelled) {
          setSubjects(safe);

          if (safe.length > 0) setValue(String(safe[0].id));
          else setValue("");
        }
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Не вдалося завантажити предмети");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleChange = (event, newValue) => {
    setValue(String(newValue));
  };

  const handleSubmit = async () => {
    try {
      const text = editorRef.current?.textContent;

      if (!text.trim()) {
        alert("Контент порожній");

        return;
      }

      setSubmitting(true);

      // 🔹 1. МОДЕРАЦІЯ ТЕКСТУ
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

      // 🔹 2. МОДЕРАЦІЯ КАРТИНОК (FormData!)
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const imageMod = await fetchWithAuth("/ai/moderate-image", {
          method: "POST",
          body: formData,
        });

        if (imageMod?.flagged) {
          setError("Одна з картинок містить заборонений контент");
          setSubmitting(false);
          return;
        }
      }
      for (const voiceFile of voiceFiles) {
        const formData = new FormData();
        formData.append("audio", voiceFile);

        const voiceMod = await fetchWithAuth("/ai/moderate-voice", {
          method: "POST",
          body: formData,
        });

        if (voiceMod?.flagged) {
          setError("Голосове повідомлення містить заборонений контент");
          setSubmitting(false);
          return;
        }
      }


      // 🔹 3. ВІДПРАВКА ДАНИХ
      const body = new FormData();
      body.append("task", text);
      body.append("subject_id", value);

      files.forEach((file) => body.append("photos", file));

      if (voiceFiles[0]) {
        body.append("voice", voiceFiles[0]);
      }
      setFiles([]);
      setPreviews([]);
      setVoiceFiles([]);

      await fetchWithAuth("/tasks", {
        method: "POST",
        body,
      });

      // 🔹 4. RESET
      editorRef.current.innerHTML = "";
      setFiles([]);
      setError("");
      setPreviews([]);
      setOpen(false);
      setRefreshKey((v) => v + 1);

    } catch (err) {
      console.error(err);
      alert("Сталася помилка при збереженні: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const createSubject = async (title) => {
    return await fetchWithAuth("/subjects", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setMessage("Введіть назву предмета");
      return;
    }

    try {
      const res = await createSubject(title);

      setSubjects((prev) => [...prev, res]);

      setTitle("");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundcolor: "#f8fdfd",
        display: "flex",
        height: "100vh",
        mt: "80px",
      }}
    >
      <Box sx={{ minWidth: 260, borderRight: 1, borderColor: "divider" }}>
        <Typography sx={{ marginTop: 2, fontWeight: 800, fontSize: 25 }}>
          Предмети
        </Typography>

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: 2,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!loading && !error && (
          <Tabs
            orientation="vertical"
            value={value}
            onChange={handleChange}
            variant="scrollable"
          >
            {subjects.map((subject) => (
              <Tab
                key={subject.id}
                value={String(subject.id)}
                label={subject.title}
                sx={{
                  alignItems: "flex-start",
                  textTransform: "none",
                  fontFamily: "Roboto",
                  fontSize: 20,
                }}
              />
            ))}
          </Tabs>
        )}
        {canEditSubject &&
          <><TextField
            placeholder="Додати предмет"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2, width: "50" }}
          ></TextField>
            <IconButton onClick={handleCreate}>
              <SendIcon sx={{ color: "black", mt: 3 }} />
            </IconButton></>
        }

      </Box>

      <AppBar
        position="fixed"
        sx={{
          top: 0,
          bottom: "auto",
          backgroundColor: "white",
          height: "80px",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, mt: "20px", ml: "20px" }}>
          <Button
            component={Link}
            to="/rating"
            variant="contained"
            sx={{
              backgroundColor: "black",
              borderRadius: "12px",
              fontWeight: 800,
            }}
          >
            Рейтинг
          </Button>
          {getCurrentUser()?.role === "admin" && (
            <Button
              component={Link}
              to="/users"
              variant="contained"
              sx={{
                backgroundColor: "black",
                borderRadius: "12px",
                fontWeight: 800,
              }}
            >
              Користувачі
            </Button>
          )}
        </Box>
        <Box
          sx={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            sx={{
              width: "200px",
              position: "fixed",
              top: "10px",
              right: "50px",
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Пошук задач..."
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter") setAppliedSearch(searchText.trim());
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchText.trim() !== "" ? (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchText("");
                        setAppliedSearch("");
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton
                      sx={{ color: "black" }}
                      onClick={() => setAppliedSearch(searchText.trim())}
                    >
                      <SearchIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
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
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              Нове завдання
            </Typography>
          </Box>

          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <IconButton onClick={CloseChange}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            ref={editorRef}
            component="div"
            contentEditable
            suppressContentEditableWarning
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
                content: '"Введіть задачу"',
                color: "#999",
                fontFamily: "Roboto",
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
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setPreviews((prev) =>
                        prev.filter((_, index) => index !== i)
                      );
                      setFiles((prev) =>
                        prev.filter((_, index) => index !== i)
                      );
                    }}
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        bgcolor: "rgba(255,0,0,0.8)",
                        color: "white",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {voiceFiles[0] && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <audio controls src={URL.createObjectURL(voiceFiles[0])} />
              <IconButton size="small" onClick={() => setVoiceFiles([])}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box
            sx={{ display: "flex", mt: 1, justifyContent: "flex-end", gap: 1 }}
          >
            <input
              type="file"
              id="upload-photo"
              hidden
              multiple
              accept="image/*"
              onChange={handleFiles}
            />
            <IconButton
              component="label"
              htmlFor="upload-photo"
              sx={{ color: "black" }}
            >
              <AddToPhotosIcon />
            </IconButton>

            <VoiceRecorder onSend={(blob) => setVoiceFiles([blob])} />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: -3 }}>
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

          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </Modal>

      <Box sx={{ flex: 1 }}>
        {subjects.map((subject) => (
          <TabPanel
            key={`panel-${subject.id}`}
            value={value}
            tabValue={String(subject.id)}
            subjectId={subject.id}
            search={appliedSearch}
            refreshKey={refreshKey}
          />
        ))}
      </Box>

      <Fab
        onClick={OpenChange}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          backgroundColor: "black",
          color: "white",
          mt: 4,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
