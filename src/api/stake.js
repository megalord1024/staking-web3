import queryString from "query-string";
import { api } from "./axios";
import axios from 'axios';

const endpoint = 'http://127.0.0.1:9000';
let end = process.env.REACT_APP_BACKEND_ENDPOINT;

console.log(end);
export const getStakes = async (filter) => {
  try {
    const result = await api.get(
      `${endpoint}/api/stake?${queryString.stringify({
        ...filter,
      })}`,
    )
    return result.data
  } catch (e) {
    return {
      error: true,
      data: e,
      errors: [],
    }
  }
}

export const getStakeDetail = async (id) => {
  try {
    const result = await api.get(`${endpoint}/api/stake/${id}`);
    return result.data;
  } catch (e) {
    return {
      error: true,
      data: e,
      errors: [],
    }
  }
}

export const createStake = async (data) => {
  try {
    await api.post(`${endpoint}/api/stake`, data);
  } catch (e) {
    return {
      error: true,
      data: e,
      errors: [],
    }
  }
}

export const updateStake = async (id, data) => {
  try {
    const result = await api.patch(`${endpoint}/api/stake/${id}`, data);
    return result.data;
  } catch (e) {
    return {
      error: true,
      data: e,
      errors: [],
    }
  }
}
