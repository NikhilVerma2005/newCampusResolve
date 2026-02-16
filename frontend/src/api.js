import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:5000/api"
// });
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
});


export default API;
