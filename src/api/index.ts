import axiosClient from './axiosClient';

const api = {
    get: (url: string, config = {}) => axiosClient.get(url, config),
    post: (url: string, data: any, config = {}) => axiosClient.post(url, data, config),
    patch: (url: string, data: any, config = {}) => axiosClient.patch(url, data, config),
    put: (url: string, data: any, config = {}) => axiosClient.put(url, data, config),
    delete: (url: string, config = {}) => axiosClient.delete(url, config),
};

export default api;

export const configMetadata = {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
}
