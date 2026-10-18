import api from "../api/axios";



export const login = async (loginData) => {

    const response = await api.post("/auth/login", loginData);

    return response.data;

};

/*

| GET /api/auth/me
|
| Since Axios Interceptor automatically attaches the JWT,
| we don't need to manually send the Authorization header.

*/

export const getCurrentUser = async () => {

    const response = await api.get("/auth/me");

    return response.data;

};

export const signup = async (signupData) => {

    const response = await api.post(
        "/auth/signup",
        signupData
    );

    return response.data;

};