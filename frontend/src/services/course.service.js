import axios from "axios";
const API_URL = "http://localhost:8080/api/courses";

class CourseService {
  post(title, description, price) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.post(
      API_URL,
      {
        title,
        description,
        price,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  // 使用學生 id 找到學生課程
  getEnrolledCourse(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + `/student/${_id}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  get(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + `/instructor/${_id}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  getCourseByName(title) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.get(API_URL + `/findByTitle/${title}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  enroll(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.post(
      API_URL + `/enroll/${_id}`,
      {},
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
}

const courseObject = new CourseService();
export default courseObject;
