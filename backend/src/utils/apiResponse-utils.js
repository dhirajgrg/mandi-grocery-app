class ApiResponse {
  constructor(statusCode, message = "Success", data = null) {
    this.statusCode = statusCode;
    this.status = "success";
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
