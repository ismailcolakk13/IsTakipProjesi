const BASE_URL = "/api";

export const fetchEmployees = () =>
  fetch(`${BASE_URL}/employees`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export const fetchSprints = () =>
  fetch(`${BASE_URL}/sprints`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export const fetchWorkLogs = (startDate, endDate) =>
  fetch(`${BASE_URL}/worklogs?start=${startDate}&end=${endDate}`).then(
    (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  );

export const saveWorkLog = (data) =>
  fetch(`${BASE_URL}/worklogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export const createEmployee = (data) =>
  fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export const createSprint = (data) =>
  fetch(`${BASE_URL}/sprints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
