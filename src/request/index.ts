import axios from "axios";
import { ElMessage } from "element-plus";

const request = axios.create({
  baseURL: 'https://gitee.com/api/v5/repos/doautumn/doautumn.gitee.io/',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

request.interceptors.request.use(
  (request) => {
    return request;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    ElMessage.error(error?.message);
    return Promise.reject(error);
  }
);

export default request;