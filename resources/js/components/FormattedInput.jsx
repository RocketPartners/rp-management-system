// resources/js/Components/FormattedInput.jsx
import { Input } from '@/Components/ui/input';

// SSS Number: XX-XXXXXXX-X
export function SSSInput({ value, onChange, ...props }) {
    const formatSSS = (val) => {
        const numbers = val.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 9)
            return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}-${numbers.slice(9, 10)}`;
    };

    const handleChange = (e) => {
        const formatted = formatSSS(e.target.value);
        onChange({ target: { value: formatted } });
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="XX-XXXXXXX-X"
            maxLength={13}
        />
    );
}

// TIN Number: XXX-XXX-XXX-XXXXX
export function TINInput({ value, onChange, ...props }) {
    const formatTIN = (val) => {
        const numbers = val.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6)
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        if (numbers.length <= 9)
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 9)}-${numbers.slice(9, 14)}`;
    };

    const handleChange = (e) => {
        const formatted = formatTIN(e.target.value);
        onChange({ target: { value: formatted } });
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="XXX-XXX-XXX-XXXXX"
            maxLength={17}
        />
    );
}

// PhilHealth Number: XXXX-XXXXX-XX
export function PhilHealthInput({ value, onChange, ...props }) {
    const formatPhilHealth = (val) => {
        const numbers = val.replace(/\D/g, '');
        if (numbers.length <= 4) return numbers;
        if (numbers.length <= 9)
            return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 9)}-${numbers.slice(9, 11)}`;
    };

    const handleChange = (e) => {
        const formatted = formatPhilHealth(e.target.value);
        onChange({ target: { value: formatted } });
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="XXXX-XXXXX-XX"
            maxLength={14}
        />
    );
}

// HDMF/Pag-IBIG Number: XXXXXXXXXXXX (12 digits, no dashes)
export function HDMFInput({ value, onChange, ...props }) {
    const formatHDMF = (val) => {
        return val.replace(/\D/g, '').slice(0, 12);
    };

    const handleChange = (e) => {
        const formatted = formatHDMF(e.target.value);
        onChange({ target: { value: formatted } });
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="XXXXXXXXXXXX"
            maxLength={12}
        />
    );
}

// Union Bank Payroll: XXXXXXXXXXXX (12 digits, no dashes)
export function PayrollAccountInput({ value, onChange, ...props }) {
    const formatPayroll = (val) => {
        return val.replace(/\D/g, '').slice(0, 12);
    };

    const handleChange = (e) => {
        const formatted = formatPayroll(e.target.value);
        onChange({ target: { value: formatted } });
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="XXXXXXXXXXXX"
            maxLength={12}
        />
    );
}

// Phone Number: +63 XXX XXX XXXX
export function PhoneInput({ value, onChange, ...props }) {
    const formatPhone = (val) => {
        const numbers = val.replace(/\D/g, '');

        // If starts with 63, keep it
        if (numbers.startsWith('63')) {
            const local = numbers.slice(2);
            if (local.length <= 3) return `+63 ${local}`;
            if (local.length <= 6)
                return `+63 ${local.slice(0, 3)} ${local.slice(3)}`;
            return `+63 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
        }

        // If starts with 0 or 9, add +63
        if (numbers.startsWith('0') || numbers.startsWith('9')) {
            const local = numbers.startsWith('0') ? numbers.slice(1) : numbers;
            if (local.length <= 3) return `+63 ${local}`;
            if (local.length <= 6)
                return `+63 ${local.slice(0, 3)} ${local.slice(3)}`;
            return `+63 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
        }

        return `+63 ${numbers}`;
    };

    const handleChange = (e) => {
        const formatted = formatPhone(e.target.value);
        onChange({ target: { value: formatted } });
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            placeholder="+63 912 345 6789"
            maxLength={17}
        />
    );
}
