import React from "react";
import { useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { fetchWithAuth } from "./helpers/api";
import TabPanel from "./TabPanel";
import { AppBar } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { Modal, Box, TextField, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

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

  const fetchTasks = async () => {
    const data = await fetchWithAuth(`/tasks/tasks/${task_id}/correct`);
    setMessages(data);
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

        if (!cancelled) {
          setSubjects(safe);

          // дефолтно вибрати перший предмет
          if (safe.length > 0) setValue(String(safe[0].id));
          else setValue(false);
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
    if (!taskText.trim()) {
      alert("Введіть текст задачі!");
      return;
    }

    try {
      await fetchWithAuth("/tasks", {
        method: "POST",
        body: JSON.stringify({
          task: taskText,
          subject_id: value,
        }),
      });

      setTaskText("");
      setOpen(false); // закрити модалку
      fetchTasks();
    } catch (error) {
      console.error("Помилка при збереженні:", error);
      alert("Сталася помилка при збереженні");
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
          <Box sx={{ display: "flex", marginTop: 2, fontSize: 25 }}></Box>
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
              textTransform: "none",
              boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              "&:hover": { backgroundColor: "#222" },
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
                        setAppliedSearch(""); // ✅ очистити фільтр
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
              Нове завдання
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <TextField
                multiline
                placeholder="Введіть задачу"
                rows={5}
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                variant="filled"
                sx={{
                  marginTop: "20px",
                  width: "350px",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  mt: "10px",
                }}
              >
                Відправити
              </Button>
            </Box>
          </Box>
        </>
      </Modal>

      <Box sx={{ flex: 1 }}>
        {subjects.map((subject) => (
          <TabPanel
            key={`panel-${subject.id}`}
            value={value}
            tabValue={String(subject.id)}
            subjectId={subject.id}
            search={appliedSearch}
          />
        ))}
      </Box>

      <Fab
        onClick={() => setOpen(true)}
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
