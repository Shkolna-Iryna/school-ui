import React from "react";
import { useEffect, useState, useRef } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { fetchWithAuth } from "./helpers/api";
import TabPanel from "./TabPanel";
import { AppBar } from "@mui/material";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { Modal, Box, TextField, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import SendIcon from '@mui/icons-material/Send';

export default function ColorTabs() {
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
  const editorRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [testResult, setTestResult] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
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
  const OpenChange = () => {
    setError("");
    setOpen(true);

  };
  const CloseChange = () => {
    setOpen(false);
    setError("");
  }

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

      setSubmitting(true); // 🔥 старт спінера

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
      body.append("task", text);
      body.append("subject_id", value);
      files.forEach((file) => body.append("photos", file));

      await fetchWithAuth("/tasks", {
        method: "POST",
        body,
      });

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
      setSubmitting(false); // 🔥 зупиняємо спінер
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

      // 🔥 Додаємо новий предмет у список
      setSubjects(prev => [...prev, res]);

      setMessage("Предмет створено ✅");
      setTitle("");

    } catch (error) {
      setMessage("Помилка створення ❌");
      console.error(error);
    }
  };
  const handleGenerateTest = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetchWithAuth("/ai/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,              // текст з інпуту
          questions_count: 10       // кількість питань
        }),
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      const parsedTest = JSON.parse(response.test);
      setTest(parsedTest);

    } catch (err) {
      setError("Помилка генерації тесту");
    } finally {
      setLoading(false);
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
          Subjects
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

        {!loading && error && <Alert severity="error">{error}</Alert>}

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
        <TextField placeholder="Додати предмет" value={title}
          onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2, width: "50" }}>
        </TextField>
        <IconButton onClick={handleCreate}
        ><SendIcon sx={{ color: "black", mt: 3 }} /></IconButton>
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
        <Box>
          <Button
            component={Link}
            to="/rating"
            variant="contained"
            sx={{
              backgroundColor: "#111",
              borderRadius: "12px",
              mt: "20px",
              ml: "20px",
              fontWeight: 800,
            }}
          >
            Рейтинг
          </Button>
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
          }}
        >

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              Нове завдання
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
            placeholder="Введіть задачу"
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