import { useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "./helpers/api";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import { flex } from "@mui/system";
import Box from "@mui/material/Box";


const TestPage = () => {
    const { taskId } = useParams();

    const [tests, setTests] = useState([]);
    const [testId, setTestId] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [correctIndexes, setCorrectIndexes] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateTest = async () => {
        if (!taskId) return;

        setLoading(true);
        setResult(null);
        setAnswers([]);

        try {
            const data = await fetchWithAuth(`/generate/${taskId}`, {
                method: "GET",
            });

            setTests(data.tests || []);
            setTestId(data.test_id || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const finishTest = async () => {
        if (!testId) return;

        try {
            const res = await checkTest(testId, answers);
            setResult(res);
            setCorrectIndexes(res.correct_indexes || []);
        } catch (error) {
            console.error(error.message);
        }
    };
    const checkTest = async (testId, answers) => {
        return await fetchWithAuth(`/check/${testId}`, {
            method: "POST",
            body: JSON.stringify({ answers }),
        });
    };

    const handleChange = (index, value) => {
        const updated = [...answers];
        updated[index] = value; 
        setAnswers(updated);
    };

    return (
        <Container >

            <Box sx={{
                justifyConіtent: "center",
                width: "100%",
            }}>
                <Typography variant="h4" sx={{ mb: 3, }}>
                    Тести
                </Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={generateTest}
                    sx={{
                        backgroundColor: "black",
                        color: "white"
                    }}
                >
                    Згенерувати тест
                </Button>
            </Box>

            {loading && <CircularProgress sx={{ mt: 3 }} />}

            {tests.map((test, index) => (
                <div key={index} style={{ marginTop: "20px" }}>
                    <Typography variant="h6">
                        {index + 1}. {test.task}
                    </Typography>

                    <RadioGroup
                        value={answers[index] ?? ""}
                        onChange={(e) => handleChange(index, Number(e.target.value))}
                    >
                        {test.options.map((option, i) => (
                            <FormControlLabel
                                key={i}
                                value={i}
                                control={<Radio />}
                                label={option}
                                sx={{
                                    color: result
                                        ? i === correctIndexes[index]
                                            ? "green"
                                            : answers[index] === i
                                                ? "red"
                                                : "inherit"
                                        : "inherit"
                                }}
                            />
                        ))}
                    </RadioGroup>

                </div>
            ))}

            {!result && tests.length > 0 && (
                <Button
                    variant="contained"
                    sx={{
                        mt: 3, backgroundColor: "black",
                        color: "white"
                    }}
                    onClick={finishTest}
                >
                    Завершити тест
                </Button>
            )}

            {result && (
                <Typography variant="h5" sx={{ mt: 3 }}>
                    Ваш результат: {result.score} / {result.total}
                </Typography>
            )}
        </Container>
    );
};

export default TestPage;
