import { BASE_URL, fetchApi, getToken } from './api';
export async function operation<T = any>(path: string, body?: unknown, method = 'POST'): Promise<T> {
    const response = await fetchApi<T>(`/mobile${path}`, body === undefined ? {} : { method, body: JSON.stringify(body) });
    if (!response.success || response.data === undefined)
        throw new Error(response.message || 'The action was not confirmed.');
    return response.data;
}
export async function uploadMedia(file: File, subject: {
    leadId?: string;
    clientId?: string;
    accessoryId?: string;
    latitude?: string;
    longitude?: string;
}) {
    if (file.size > 65 * 1024 * 1024)
        throw new Error('Choose a file smaller than 65 MB.');
    if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'].includes(file.type))
        throw new Error('Choose a JPEG, PNG, WebP, MP4 or MOV file.');
    const session = await operation<{
        id: string;
        chunkBytes: number;
        parts: number;
    }>('/media/uploads', { ...subject, size: file.size, contentType: file.type });
    for (let index = 0; index < session.parts; index++) {
        const response = await fetch(`${BASE_URL}/mobile/media/uploads/${session.id}/${index}`, { method: 'PUT', headers: {
                Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/octet-stream', 'X-Site': localStorage.getItem('byd_floor_site') || '',
            }, body: file.slice(index * session.chunkBytes, Math.min((index + 1) * session.chunkBytes, file.size)) });
        const result = await response.json();
        if (!response.ok || !result.success)
            throw new Error(result.message || 'Upload failed. Choose the file again to retry.');
    }
    return operation<{
        id: string;
        kind: string;
        publicUrl: string;
        durationSeconds?: number;
    }>(`/media/uploads/${session.id}/complete`, {});
}
