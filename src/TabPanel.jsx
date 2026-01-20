import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PropTypes from "prop-types";
import { fetchWithAuth } from "./helpers/api";
import { Button, IconButton, Typography } from "@mui/material";
import Pagination from "@mui/material/Pagination";

export default function TabPanel({ value, tabValue, subjectId, search }) {
  const isActive = String(value) === String(tabValue);

  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / perPage));

  // коли перемикаємо subject — стартуємо з 1 сторінки
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
        const params = new URLSearchParams();
        params.set("subject_id", String(subjectId));
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        if (search && search.trim()) {
          params.set("search", search.trim());
        }

        const data = await fetchWithAuth(`/tasks?${params.toString()}`);

        if (cancelled) return;

        // ✅ ВАЖЛИВО: тут саме під { count, items }
        const items = Array.isArray(data?.items) ? data.items : [];
        const totalCount = Number.isFinite(data?.count) ? data.count : 0;

        setTasks(items);
        setCount(totalCount);

        // якщо page виліз за totalPages — підрівняти
        const pages = Math.max(1, Math.ceil(totalCount / perPage));
        if (page > pages) setPage(pages);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Не вдалося завантажити задачі");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [isActive, subjectId, page, perPage, search]);

  return (
    <div role="tabpanel" hidden={!isActive} id={`tabpanel-${tabValue}`}>
      {isActive && (
        <Box
          sx={{
            p: 3,
            minHeight: "100vh",
            background: "linear-gradient(180deg, #f8fdfd 0%, #f4f7ff 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Питання
            </Typography>
          </Box>

          {!loading && !error && (
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 1, color: "#555" }}
            >
              Всього задач: {count}
            </Typography>
          )}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && tasks.length === 0 && (
            <Typography>Немає задач для цього предмету</Typography>
          )}

          {!loading && !error && tasks.length > 0 && (
            <>
              <List sx={{ width: "100%" }}>
                {tasks.map(({ id, primary, secondary, person, task, user }) => (
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
                        transition:
                          "transform 120ms ease, box-shadow 120ms ease",
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

                        <Typography
                          sx={{
                            fontSize: 14,
                            mb: 1,
                            color: "#111",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {task}
                        </Typography>

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
                            to={`/answer/${id}`}
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
                            Перейти до відповідей →
                          </Button>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </List>
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 2, pb: 2 }}
              >
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(e, newPage) => setPage(newPage)}
                  shape="rounded"
                />
              </Box>
            </>
          )}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tabValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  subjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  search: PropTypes.string,
};
