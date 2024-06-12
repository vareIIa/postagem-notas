import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Criterios from "/./criterios.json"; // Corrigi o caminho do arquivo
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";

const Validacao = () => {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [grade, setGrade] = useState("");
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState("");
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [buttonText, setButtonText] = useState("Buscar");
  const [enrolledId, setEnrolledId] = useState(null);
  const [selectedDesafio, setSelectedDesafio] = useState("");
  const [criteriosDesafio, setCriteriosDesafio] = useState([]);
  const [criteriosValues, setCriteriosValues] = useState({});

  const clearFields = () => {
    setGrade("");
    setChallenge("");
    setComment("");
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://api-hml.pdcloud.dev/enrolled/email/${email}`,
        {
          headers: {
            "API-KEY": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Deu erro :( código do erro: ${response.status}`);
      }

      const data = await response.json();

      setEnrolledId(data.enrolledId);
      setSearchResult(data);
      setSnackbarMessage("Aluno encontrado!");
      setSeverity("success");
      setOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Aluno não encontrado!");
      setSeverity("error");
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccess(false);
    setOpenError(false);
    setOpen(false);
    setButtonText("Nova busca");
  };

  const challengeMap = {
    1: "Python",
    2: "Linux",
    3: "IntroWeb",
    4: "NoCode",
    5: "Scratch",
    6: "ElementosDeInterface",
  };

  const handleChangeDesafio = (event) => {
    const desafioId = event.target.value;
    const desafio = Criterios.desafios.find((d) => d.id === desafioId);

    if (desafio) {
      setSelectedDesafio(desafio.desafio);
      let criterios = [];
      if (desafio.criterios) {
        criterios = Object.entries(desafio.criterios);
      } else if (desafio.criteriosPAC) {
        criterios = Object.entries(desafio.criteriosPAC);
      } else {
        criterios = Object.entries(desafio.criterios);
      }
      setCriteriosDesafio(criterios);
      setCriteriosValues(
        criterios.reduce((acc, [key, value]) => {
          acc[key] = "";
          return acc;
        }, {})
      );
    } else {
      setSelectedDesafio("");
      setCriteriosDesafio([]);
      setCriteriosValues({});
    }
  };

  const handleChangeCriterio = (event, key) => {
    setCriteriosValues({
      ...criteriosValues,
      [key]: event.target.value,
    });
  };

  const handleSubmitGrade = async (event) => {
    event.preventDefault();

    let operationSuccessful = false;

    try {
      if (!searchResult || !searchResult.id) {
        console.error("searchResult or searchResult.id is undefined");
        return;
      }

      const enrolledId = searchResult.id;
      const challengeEnum = challengeMap[challenge];

      const gradeNumber = parseFloat(grade);
      if (isNaN(gradeNumber) || gradeNumber < 0) {
        throw new Error("Nota deve ser um número válido e maior ou igual a 0.");
      }

      const status = "Aprovado"; // Supondo que o status é uma string e deve ser definida de alguma forma

      const response = await fetch("https://api-hml.pdcloud.dev/challenge/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-KEY": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
        },
        body: JSON.stringify({
          enrolledId: enrolledId,
          challenge: challengeEnum,
          comment: comment || null,
          grade: gradeNumber,
          status: status,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erro ao enviar a nota: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();

      if (data && data.id) {
        setEnrolledId(data.id); 
      } else {
        console.error("data or data.id is undefined");
      }

      setComment("");
      setGrade("");
      setChallenge("");
      clearFields();
      setSnackbarMessage("Nota enviada com sucesso!");
      setSeverity("success");
      setOpen(true);
      operationSuccessful = true;

    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Erro ao enviar a nota: ${error.message}`);
      setSeverity("error");
      setOpen(true);
    }
  };

  const handleChangeGrade = async () => {
    if (!enrolledId) {
      console.error("enrolledId is undefined");
      return;
    }
    try {
      const response = await fetch(
        `https://api-hml.pdcloud.dev/enrolled/email/${email}`,
        {
          headers: {
            "API-KEY": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar os dados do aluno: ${response.status}`);
      }

      const data = await response.json();
      const enrolledId = data.id;
      const challengeEnum = challengeMap[challenge];

      const responseEDIT = await fetch(
        `https://api-hml.pdcloud.dev/challenge/enrolled/${enrolledId}?challenge=${challengeEnum}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "API-KEY": "Rm9ybUFwaUZlaXRhUGVsb0plYW5QaWVycmVQYXJhYURlc2Vudm9sdmU=",
          },
          body: JSON.stringify({
            grade: parseFloat(grade),
            comment: comment || null,
          }),
        }
      );

      if (!responseEDIT.ok) {
        throw new Error(
          `Erro ao atualizar a nota: código do erro: ${responseEDIT.status}`
        );
      }

      const data2 = await responseEDIT.json();
      setSearchResult(data2);
      setSnackbarMessage("Nota atualizada com sucesso!");
      setSeverity("success");
      setOpen(true);

    } catch (error) {
      console.error(error);
      setSnackbarMessage("Erro ao atualizar a nota!");
      setSeverity("error");
      setOpen(true);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 450,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 400 }}
      >
        <TextField
          style={{ minWidth: 280 }}
          color="secondary"
          label="E-mail"
          focused
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          color="secondary"
          variant="contained"
          style={{ minWidth: 130 }}
          onClick={handleSearch}
        >
          {buttonText}
        </Button>
      </Box>

      {searchResult && (
        <Fade in={true}>
          <Box style={{ fontSize: "15px" }}>
            <Box sx={{ width: 420, marginTop: 2 }}>
              <Box sx={{ maxWidth: 550, marginBottom: 2 }}>
                <Box>
                  <FormControl focused color="secondary" fullWidth>
                    <InputLabel id="desafios-label">
                      Selecione a matéria
                    </InputLabel>
                    <Select
                      labelId="desafios-label"
                      id="desafios"
                      value={selectedDesafio}
                      label="Selecione a matéria"
                      onChange={handleChangeDesafio}
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {Criterios.desafios.map((desafio) => (
                        <MenuItem key={desafio.id} value={desafio.id}>
                          {desafio.desafio}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {selectedDesafio && (
                  <Box sx={{ marginTop: 1, fontFamily: "Rajdhani" }}>
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <h2 style={{ marginBottom: 20 }}>
                        Critérios para {selectedDesafio}
                      </h2>
                    </Box>

                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 2,
                        }}
                      >
                        {criteriosDesafio.map(([key, criterio]) => (
                          <TextField
                            key={key}
                            color="secondary"
                            label={criterio}
                            variant="outlined"
                            style={{
                              marginTop: 5,
                              maxWidth: 200,
                              minWidth: 200,
                              width: 200,
                              textAlign: "center",
                              fontFamily: "Rajdhani",
                            }}
                            focused
                            value={criteriosValues[key]}
                            onChange={(event) => handleChangeCriterio(event, key)}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Comentários"
                  focused
                  color="secondary"
                  multiline
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  sx={{ marginBottom: 1, width: 420 }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                ></Box>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: 10,
                    gap: 5,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitGrade}
                  >
                    Enviar
                  </Button>

                  <Button
                    style={{
                      maxWidth: 10,
                      fontSize: 12,
                      maxHeight: 55,
                      marginLeft: 5,
                    }}
                    color="secondary"
                    variant="contained"
                    onClick={handleChangeGrade}
                  >
                    Editar
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>
      )}

      <Snackbar open={openSuccess} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" variant="filled">
          Nota enviada com sucesso!
        </Alert>
      </Snackbar>

      <Snackbar open={openError} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" variant="filled">
          Erro ao enviar a nota!
        </Alert>
      </Snackbar>

      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Validacao;
