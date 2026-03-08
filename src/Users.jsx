import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import { fetchWithAuth } from "./helpers/api";

const ROLE_LABELS = {
  admin: "Адмін",
  teacher: "Вчитель",
  student: "Учень",
};

const ROLE_OPTIONS = ["admin", "teacher", "student"];
const ROWS_PER_PAGE = 10;

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getUserId(user) {
  return user?.id ?? user?.user_id ?? null;
}

export default function Rating() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [savingUserId, setSavingUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUser = useMemo(getCurrentUser, []);
  const isAdmin = currentUser?.role === "admin";
  const isMenuOpen = Boolean(menuAnchorEl);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchWithAuth(
          `/users?page=${page}&per_page=${ROWS_PER_PAGE}`
        );

        if (cancelled) return;

        setRows(Array.isArray(data?.items) ? data.items : []);
        setPages(Number(data?.pages) > 0 ? data.pages : 1);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Не вдалося завантажити користувачів");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const openRoleMenu = useCallback((event, user) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUser(user);
  }, []);

  const closeRoleMenu = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedUser(null);
  }, []);

  const handlePageChange = useCallback((_, value) => {
    setPage(value);
  }, []);

  const handleRoleChange = useCallback(
    async (nextRole) => {
      if (!selectedUser) return;

      const targetUserId = getUserId(selectedUser);
      const prevRole = selectedUser.role ?? "student";

      if (!targetUserId) {
        setError("Не вдалося визначити ID користувача");
        return;
      }

      closeRoleMenu();
      setSavingUserId(targetUserId);
      setError("");

      setRows((prev) =>
        prev.map((user) =>
          getUserId(user) === targetUserId ? { ...user, role: nextRole } : user
        )
      );

      try {
        await fetchWithAuth(`/users/${targetUserId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: nextRole }),
        });

        setSuccessMessage("Роль успішно оновлено");
      } catch (e) {
        setRows((prev) =>
          prev.map((user) =>
            getUserId(user) === targetUserId ? { ...user, role: prevRole } : user
          )
        );
        setError(e?.message || "Не вдалося змінити роль");
      } finally {
        setSavingUserId(null);
      }
    },
    [selectedUser, closeRoleMenu]
  );

  const renderRoleCell = useCallback(
    (user) => {
      const role = user.role || "student";
      const isSaving = savingUserId === getUserId(user);

      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={ROLE_LABELS[role] || role}
            size="small"
            variant="outlined"
          />

          {isAdmin && (
            <Tooltip title="Змінити роль">
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => openRoleMenu(e, user)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <CircularProgress size={18} />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      );
    },
    [isAdmin, openRoleMenu, savingUserId]
  );

  return (
    <Box sx={{ minHeight: "100vh", p: 3, bgcolor: "#f8fdfd" }}>
      <Paper
        elevation={6}
        sx={{ maxWidth: 1000, mx: "auto", p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Користувачі
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Користувач</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Роль</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.length > 0 ? (
                    rows.map((user) => (
                      <TableRow key={getUserId(user)} hover>
                        <TableCell>{user.name || "Без імені"}</TableCell>
                        <TableCell>{user.email || "Без email"}</TableCell>
                        <TableCell>{renderRoleCell(user)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{ textAlign: "center", py: 6, color: "#666" }}
                      >
                        Користувачі відсутні
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, pb: 2 }}>
              <Pagination
                count={pages}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
              />
            </Box>
          </>
        )}

        <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={closeRoleMenu}>
          {ROLE_OPTIONS.map((role) => (
            <MenuItem
              key={role}
              onClick={() => handleRoleChange(role)}
              selected={selectedUser?.role === role}
            >
              {ROLE_LABELS[role]}
            </MenuItem>
          ))}
        </Menu>
      </Paper>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={2500}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Box>
  );
}