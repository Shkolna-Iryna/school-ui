import { useEffect, useState } from "react";
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

import { fetchWithAuth } from "./helpers/api"; // поправ шлях якщо інший

export default function Rating() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchWithAuth("/rating");
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Не вдалося завантажити рейтинг");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", p: 3, bgcolor: "#f8fdfd" }}>
      <Paper
        elevation={6}
        sx={{ maxWidth: 900, mx: "auto", p: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Рейтинг користувачів
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Користувач</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Правильні відповіді
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((u, idx) => (
                  <TableRow key={u.user_id ?? idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{u.name || "Без імені"}</TableCell>
                    <TableCell align="right">
                      {u.correct_answers ?? 0}
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ textAlign: "center", py: 6, color: "#666" }}
                    >
                      Немає даних для рейтингу
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
