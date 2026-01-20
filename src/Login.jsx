import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { TextField, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "./helpers/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SchemaLogin } from "./Schema.js";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SchemaLogin),
    mode: "onSubmit",
  });

  useEffect(() => {
    document.body.style.background = "#f8fdfd";

    return () => {
      document.body.style.background = "";
    };
  }, []);
  const onSubmit = async (formData) => {
    try {
      const response = await fetchWithAuth("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      localStorage.setItem("access_token", response.access_token);
      navigate("/sub");
    } catch (err) {
      alert(err.message);
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={7}
        sx={{
          width: 400,
          height: 400,
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography
            sx={{
              color: "black",
              fontFamily: "Roboto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "35px",
              fontWeight: "700",
              marginTop: "10px",
            }}
          >
            Увійти
          </Typography>

          <Typography sx={{ marginLeft: "25px" }}>
            Введіть електронну пошту
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <TextField
              placeholder="Електронна пошта"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                width: 350,
                "& .MuiInputBase-root": {
                  height: 40,
                  borderRadius: "15px",
                  marginTop: "10px",
                },
              }}
            />
          </Box>
          <Typography sx={{ marginTop: "10px", marginLeft: "25px" }}>
            Введіть пароль
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <TextField
              placeholder="Пароль"
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                width: 350,
                "& .MuiInputBase-root": {
                  height: 40,
                  borderRadius: "15px",
                  marginTop: "10px",
                },
              }}
            />
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: "black",
                width: 350,
                borderRadius: "10px",
              }}
            >
              Увійти
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography sx={{ marginTop: "15px", fontSize: "15px" }}>
              Ще не маєте акаунта?
            </Typography>
            <Typography
              sx={{ marginTop: "15px", fontSize: "15px" }}
              component={Link}
              to="/sign_in"
            >
              Зареєструйтесь
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
