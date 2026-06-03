import { apiGet, apiDelete, apiFetch, apiPostFormData, getAccessToken } from '@/lib/spring-boot-api';
import type { PagedResponse, PayPeriodResponse, PayslipResponse } from '@/types';

const API_URL =
    import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1';

export function getPayPeriods(): Promise<PayPeriodResponse[]> {
    return apiGet<PayPeriodResponse[]>('/pay-periods');
}

export interface PayslipListParams {
    employeeId?: number;
    payPeriodId?: number;
    page?: number;
    size?: number;
}

export function getPayslips(
    params: PayslipListParams,
): Promise<PagedResponse<PayslipResponse>> {
    const query = new URLSearchParams();
    if (params.employeeId != null) query.set('employeeId', String(params.employeeId));
    if (params.payPeriodId != null) query.set('payPeriodId', String(params.payPeriodId));
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return apiGet<PagedResponse<PayslipResponse>>(`/payslips?${query.toString()}`);
}

export function uploadPayslip(
    employeeId: number,
    payPeriodId: number,
    file: File,
): Promise<PayslipResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
        'payslip',
        new Blob([JSON.stringify({ employeeId, payPeriodId })], {
            type: 'application/json',
        }),
    );
    return apiPostFormData<PayslipResponse>('/payslips', formData);
}

/**
 * Replace an existing payslip's file. Uses a raw PUT because the shared
 * apiPut helper forces a JSON content-type, which would break multipart.
 */
export async function replacePayslip(id: number, file: File): Promise<PayslipResponse> {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/payslips/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as PayslipResponse;
}

export function deletePayslip(id: number): Promise<void> {
    return apiDelete<void>(`/payslips/${id}`);
}

/** Streams the decrypted PDF through the authorized endpoint and opens it in a new tab. */
export async function downloadPayslip(id: number): Promise<void> {
    const res = await apiFetch(`/payslips/${id}/download`);
    if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
