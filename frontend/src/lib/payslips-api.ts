import {
    apiGet,
    apiDelete,
    apiFetch,
    apiPost,
    apiPostFormData,
    getAccessToken,
    refreshAccessToken,
} from '@/lib/spring-boot-api';
import type {
    PagedResponse,
    PayPeriodResponse,
    PayslipResponse,
    UploadPayslipRequest,
} from '@/types';

export interface LineItemInput {
    category: 'EARNING' | 'DEDUCTION' | 'ALLOWANCE';
    label: string;
    amount: number;
}

const API_URL =
    import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1';

/**
 * Multipart PUT with the same auth handling as apiPostFormData: it sets only the
 * Authorization header (the browser supplies the multipart boundary) and, on a
 * 401, refreshes the access token once and retries before giving up. apiFetch /
 * apiPut can't be reused here because they force a JSON Content-Type, which would
 * corrupt the multipart body.
 */
async function apiPutFormData<T>(path: string, formData: FormData): Promise<T> {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const send = (bearer: string): Promise<Response> =>
        fetch(`${API_URL}${path}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${bearer}` },
            body: formData,
        });

    let res = await send(token);

    if (res.status === 401) {
        try {
            await refreshAccessToken();
            const refreshed = getAccessToken();
            if (!refreshed) throw new Error('Session expired');
            res = await send(refreshed);
        } catch {
            throw new Error('Session expired');
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
}

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

/** Employee self-service: the current user's own payslips only. */
export function getMyPayslips(
    params: { payPeriodId?: number; page?: number; size?: number } = {},
): Promise<PagedResponse<PayslipResponse>> {
    const query = new URLSearchParams();
    if (params.payPeriodId != null) query.set('payPeriodId', String(params.payPeriodId));
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return apiGet<PagedResponse<PayslipResponse>>(`/payslips/me?${query.toString()}`);
}

export function uploadPayslip(
    employeeId: number,
    payPeriodId: number,
    file: File,
): Promise<PayslipResponse> {
    const payslip: UploadPayslipRequest = { employeeId, payPeriodId };
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
        'payslip',
        new Blob([JSON.stringify(payslip)], {
            type: 'application/json',
        }),
    );
    return apiPostFormData<PayslipResponse>('/payslips', formData);
}

/** Manually create a payslip from line items; the backend renders + stores the PDF. */
export function generatePayslip(request: {
    employeeId: number;
    payPeriodId: number;
    lineItems: LineItemInput[];
}): Promise<PayslipResponse> {
    return apiPost<PayslipResponse>('/payslips/generate', request);
}

/**
 * Replace an existing payslip's file. Routes through apiPutFormData so an expired
 * access token is refreshed and the request retried, instead of failing with a
 * bare 401.
 */
export async function replacePayslip(id: number, file: File): Promise<PayslipResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiPutFormData<PayslipResponse>(`/payslips/${id}`, formData);
}

export function deletePayslip(id: number): Promise<void> {
    return apiDelete<void>(`/payslips/${id}`);
}

/**
 * Streams the decrypted PDF through the authorized endpoint and saves it via a
 * hidden anchor click. A post-await window.open is treated as a programmatic
 * popup and blocked (notably by Safari); the anchor pattern from download-file.ts
 * works from async context.
 */
export async function downloadPayslip(id: number): Promise<void> {
    const res = await apiFetch(`/payslips/${id}/download`);
    if (!res.ok) {
        if (res.status === 404) {
            throw new Error('This payslip file is no longer available.');
        }
        throw new Error(`Download failed (${res.status})`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `payslip-${id}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        // Defer revoke so the browser has time to start the download.
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
}
