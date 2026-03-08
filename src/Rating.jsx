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
import Pagination from "@mui/material/Pagination";
import { fetchWithAuth } from "./helpers/api";

export default function Rating() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchWithAuth(
          `/rating?page=${page}&per_page=${rowsPerPage}`
        );

        if (!cancelled) {
          setRows(data.items || []);
          setPages(data.pages || 1);
        }
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
  }, [page]);

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
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      Користувач
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Правильні відповіді
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((u, idx) => (
                    <TableRow key={u.user_id ?? idx} hover>
                      <TableCell>
                        {(page - 1) * rowsPerPage + idx + 1}
                      </TableCell>

                      <TableCell>{u.name || "Без імені"}</TableCell>

                      <TableCell align="right">
                        {u.correct_answers ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{
                          textAlign: "center",
                          py: 6,
                          color: "#666",
                        }}
                      >
                        Немає даних для рейтингу
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
                onChange={(e, value) => setPage(value)}
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    backgroundColor: "#e9ecef",
                    borderRadius: 2,
                    minWidth: 40,
                    height: 40,
                    fontWeight: 600,
                    color: "#333",
                  },

                  "& .Mui-selected": {
                    backgroundColor: "#d0d5da",
                    color: "#000",
                  },

                  "& .MuiPaginationItem-previousNext": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              /></Box>

          </>
        )}
      </Paper>
    </Box>
  );
}
