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

export const submitLiveGuess = async (player_id: number, fact_id: number, guessed_player_id: number) => {
  const res = await axios.post(API_BASE + "submit_live_guess/", { player_id, fact_id, guessed_player_id });
  return res.data;
};

export const getScoreboard = async (token: string) => {
  const res = await axios.get(API_BASE + `scoreboard/${token}/`);
  return res.data;
};

export const finishStoryTelling = async (player_id: number, token: string) => {
  const res = await axios.post(API_BASE + "finish_story/", { player_id, token });
  return res.data;
};

export const submitStoryRating = async (player_id: number, fact_id: number, rating: number) => {
  const res = await axios.post(API_BASE + "submit_story_rating/", { player_id, fact_id, rating });
  return res.data;
};

export const kickPlayer = async (token: string, player_id: number, requester_id: number) => {
  const res = await axios.post(API_BASE + "kick/", { token, player_id, requester_id });
  return res.data;
};

export const endGame = async (token: string, requester_id?: number) => {
  const res = await axios.post(API_BASE + "end/", { token, requester_id });
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

export const setCurrentFact = async (token: string, fact_id: number | null) => {
  const res = await axios.post(API_BASE + "set_current_fact/", { token, fact_id });
  return res.data;
};
