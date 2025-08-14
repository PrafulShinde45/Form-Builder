import axios from 'axios';

// In single-service deployments (Render web service), the client is served
// from the same origin as the API. Use relative baseURL so no env is needed.
const api = axios.create({ baseURL: '/api' });

export default api;

