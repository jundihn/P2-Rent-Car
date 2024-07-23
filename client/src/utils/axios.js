import axios from "axios";

const data = axios.create({
  baseURL: "http://localhost:3000",
  // baseURL: "https://server.jundi.site/",
});

export default data;
