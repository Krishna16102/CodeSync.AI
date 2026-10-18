import api from "../api/axios";

// GET PROJECT MEMBERS
export async function getProjectMembers(projectId) {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data;
}

// GET MY PROJECT ROLE
export async function getMyProjectRole(projectId) {
  const response = await api.get(`/projects/${projectId}/members/my-role`);
  return response.data;
}

// INVITE MEMBER
export async function inviteMember(projectId, username, role) {
  const response = await api.post(`/projects/${projectId}/members`, {
    username,
    role,
  });
  return response.data;
}

// UPDATE MEMBER ROLE
export async function updateMemberRole(projectId, memberId, role) {
  const response = await api.patch(`/projects/${projectId}/members/${memberId}`, {
    role,
  });
  return response.data;
}

// REMOVE MEMBER
export async function removeMember(projectId, memberId) {
  await api.delete(`/projects/${projectId}/members/${memberId}`);
}