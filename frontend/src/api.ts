import axios from "axios";

const API_BASE = "/api/game/";

export const createGame = async (name: string) => {
  const res = await axios.post(API_BASE + "create/", { name });
  return res.data;
};

export const joinGame = async (token: string, name: string, is_host = false) => {
  const res = await axios.post(API_BASE + "join/", { token, name, is_host });
  return res.data;
};

export const submitFact = async (player_id: number, text: string) => {
  const res = await axios.post(API_BASE + "submit_fact/", { player_id, text });
  return res.data;
};

export const getGameState = async (token: string) => {
  const res = await axios.get(API_BASE + `state/${token}/`);
  return res.data;
};

export const sendGuessEvent = async (fact_id: number, correct_guesser_id: number, wrong_guess_count: number) => {
  const res = await axios.post(API_BASE + "guess_event/", { fact_id, correct_guesser_id, wrong_guess_count });
  return res.data;
};

export const getScoreboard = async (token: string) => {
  const res = await axios.get(API_BASE + `scoreboard/${token}/`);
  return res.data;
};

export const revealStory = async (fact_id: number, story: string) => {
  const res = await axios.post(API_BASE + "reveal_story/", { fact_id, story });
  return res.data;
};

export const endGame = async (token: string) => {
  const res = await axios.post(API_BASE + "end/", { token });
  return res.data;
};

export const getStats = async (token: string) => {
  const res = await axios.get(API_BASE + `stats/${token}/`);
  return res.data;
};

export const startGame = async (token: string) => {
  const res = await axios.post(API_BASE + "start/", { token });
  return res.data;
};
