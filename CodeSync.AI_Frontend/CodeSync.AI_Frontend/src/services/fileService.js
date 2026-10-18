import api from "../api/axios";

// GET PROJECT FILES
export async function getProjectFiles(projectId) {
  const response = await api.get(`/projects/${projectId}/files`);
  return response.data;
}

// GET FILE CONTENT
export async function getFileContent(projectId, path) {
  const response = await api.get(`/projects/${projectId}/files/content`, {
    params: { path },
  });
  return response.data;
}

// GET ALL PROJECT FILE CONTENT
export async function getProjectFileContents(projectId, files) {
  const result = {};

  if (!Array.isArray(files)) {
    return result;
  }

  for (const file of files) {
    const path = typeof file === "string" ? file : file?.path;

    if (!path) continue;

    if (file?.type && String(file.type).toUpperCase() !== "FILE") continue;

    try {
      const data = await getFileContent(projectId, path);
      result[path] = data?.content || "";
    } catch (error) {
      console.error(`Failed to load ${path}:`, error);
    }
  }

  return result;
}

// SAVE FILE
export async function saveFile(projectId, path, content) {
  const response = await api.put(`/projects/${projectId}/files`, {
    path,
    content,
  });
  return response.data;
}

// DELETE FILE
export async function deleteFile(projectId, path) {
  const response = await api.delete(`/projects/${projectId}/files`, {
    params: { path },
  });
  return response.data;
}

// RENAME FILE
export async function renameFile(projectId, oldPath, newPath) {
  const fileData = await getFileContent(projectId, oldPath);

  await saveFile(projectId, newPath, fileData?.content || "");
  await deleteFile(projectId, oldPath);

  return {
    path: newPath,
    content: fileData?.content || "",
  };
}