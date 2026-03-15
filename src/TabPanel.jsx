import * as React from "react";
import { useEffect, useState } from "react";
import { Box, List, ListItemButton, ListItemAvatar, Avatar, Typography, Button, ListItemText, CircularProgress, Alert, Pagination } from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import TaskImages from "./Images";
import { fetchWithAuth } from "./helpers/api";
import { UPLOADS_URL } from "./helpers/api";
import DeleteIcon from '@mui/icons-material/Delete';
import { display } from "@mui/system";
import IconButton from "@mui/material/IconButton";


export default function TabPanel({ value, tabValue, subjectId, search, refreshKey }) {
  const isActive = String(value) === String(tabValue);
  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioURL, setAudioURL] = useState(null);


  const totalPages = Math.max(1, Math.ceil(count / perPage));

  useEffect(() => {
    if (!isActive) return;
    setPage(1);
  }, [isActive, subjectId]);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    const loadTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          subject_id: String(subjectId),
          page: String(page),
          per_page: String(perPage)
        });

        if (search?.trim()) {
          params.set("search", search.trim());
        }

        const data = await fetchWithAuth(`/tasks?${params.toString()}`);
        if (cancelled) return;

        setTasks(Array.isArray(data?.items) ? data.items : []);
        setCount(Number.isFinite(data?.count) ? data.count : 0);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Не вдалося завантажити задачі");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const handleSend = (blob) => {
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    };

    loadTasks();
    return () => { cancelled = true; };
  }, [isActive, subjectId, page, perPage, search, refreshKey]);

  const getVoiceURL = (voicePath) => {
    if (!voicePath) return null;
    return `${UPLOADS_URL}/${voicePath}`
  };

  return (
    <div role="tabpanel" hidden={!isActive} id={`tabpanel-${tabValue}`}>
      {isActive && (
        <Box sx={{ p: 3, minHeight: "100vh", background: "linear-gradient(180deg, #f8fdfd 0%, #f4f7ff 100%)" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Питання</Typography>

          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && tasks.length === 0 && <Typography>Немає задач для цього предмету</Typography>}

          {!loading && !error && tasks.length > 0 && (
            <List sx={{ width: "100%", backgroundColor: "#f9f9f9", borderRadius: 2 }}>
              {tasks.map(({ id, primary, secondary, person, task, user, image_url, voice_url }) => (
                <ListItemButton key={id} sx={{
                  mb: 1, borderRadius: 2, backgroundColor: "#fff", padding: 2, position: "relative",
                  gap: 2
                }}>
                  <ListItemAvatar sx={{ minWidth: 56, mt: 0.5 }}>
                    <Avatar
                      alt="Profile Picture"
                      src={person}
                      sx={{ width: 44, height: 44, border: "2px solid rgba(52,49,219,0.15)", backgroundColor: "#e0e0e0" }}
                    />
                  </ListItemAvatar>

                  <Box sx={{ width: "100%" }}>
                    <Typography sx={{ color: "#3431db", fontWeight: 800, fontSize: 14, mb: 0.25 }}>
                      {user.name}
                    </Typography>

                    <Typography sx={{ fontSize: 14, mb: 1, color: "#111", lineHeight: 1.4, wordBreak: "break-word" }}>
                      {task}
                    </Typography>

                    {image_url?.length > 0 && <TaskImages images={image_url} />}

                    {voice_url && (
                      <Box sx={{ mt: 1 }}>
                        <audio
                          controls
                          src={getVoiceURL(voice_url)}
                          style={{ width: 220 }}
                        />
                      </Box>
                    )}

                    <ListItemText
                      primary={primary}
                      secondary={secondary}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 700, color: "#222" }}
                      secondaryTypographyProps={{ fontSize: 13, color: "#666" }}
                      sx={{ m: 0 }}
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                      <Button
                        component={Link}
                        to={`/answer/${id}`}
                        variant="text"
                        sx={{
                          color: "#3431db",
                          fontWeight: 800,
                          textTransform: "none",
                          borderRadius: 2,
                          px: 1.5,
                          "&:hover": { backgroundColor: "rgba(52,49,219,0.08)" }
                        }}
                      >
                        Перейти до відповідей →
                      </Button>
                    </Box>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}

          {!loading && !error && tasks.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                page={page}
                count={totalPages}
                onChange={(e, newPage) => setPage(newPage)}
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tabValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  search: PropTypes.string,
  refreshKey: PropTypes.number
};