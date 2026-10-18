import api from "../api/axios";


export async function getMyProjects() {

    const response = await api.get("/projects");

    return response.data;

}

export async function getProjectById(projectId) {

    const response = await api.get(`/projects/${projectId}`);

    return response.data;

}




export async function createProject(projectData) {

    const response = await api.post("/projects", projectData);

    return response.data;

}


export async function updateProject(projectId, projectData) {

    const response = await api.patch(
        `/projects/${projectId}`,
        projectData
    );

    return response.data;

}

export async function deleteProject(projectId) {

    await api.delete(`/projects/${projectId}`);

}