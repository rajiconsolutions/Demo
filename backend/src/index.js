import { server } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8000;

server.listen(process.env.PORT || 8000, () => {
  console.log(`server is running at port : ${PORT}`);
});
