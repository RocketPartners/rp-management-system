import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Bell, Globe, Moon, Sun, Monitor, Search, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useTimezone } from '@/hooks/use-timezone';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const NOTIFICATION_CATEGORIES = [
    { key: 'leave', label: 'Leave Requests', description: 'Approvals, rejections, and cancellations' },
    { key: 'ticket', label: 'Support Tickets', description: 'Replies and status updates' },
    { key: 'onboarding', label: 'Onboarding', description: 'Submissions and reviews' },
] as const;

function getNotificationPrefs(): Record<string, boolean> {
    try {
        const stored = localStorage.getItem('notification-preferences');
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { leave: true, ticket: true, onboarding: true };
}

function setNotificationPrefs(prefs: Record<string, boolean>) {
    localStorage.setItem('notification-preferences', JSON.stringify(prefs));
}

function getPushEnabled(): boolean {
    try { return localStorage.getItem('push-enabled') !== 'false'; }
    catch { return true; }
}

const ALL_TIMEZONES = (() => {
    try { return Intl.supportedValuesOf('timeZone'); }
    catch { return ['America/New_York', 'Europe/London', 'Europe/Madrid', 'Asia/Manila', 'Asia/Tokyo', 'Australia/Sydney']; }
})();

function formatTimezoneOffset(tz: string): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date());
        return parts.find((p) => p.type === 'timeZoneName')?.value || '';
    } catch { return ''; }
}

function SectionCard({ icon: Icon, iconBg, title, description, children }: {
    icon: typeof Globe; iconBg: string; title: string; description: string; children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-start gap-3">
                <div className={cn('rounded-lg p-2', iconBg)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    <p className="mt-0.5 text-sm text-gray-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function PreferencesTab() {
    const { timezone, setTimezone } = useTimezone();
    const { appearance, updateAppearance } = useAppearance();
    const [notifPrefs, setNotifPrefs] = useState(getNotificationPrefs);
    const [pushEnabled, setPushEnabled] = useState(getPushEnabled);
    const [tzSearch, setTzSearch] = useState('');

    const filteredTimezones = useMemo(() => {
        if (!tzSearch) return ALL_TIMEZONES.slice(0, 15);
        const q = tzSearch.toLowerCase();
        return ALL_TIMEZONES.filter((tz) => tz.toLowerCase().includes(q)).slice(0, 15);
    }, [tzSearch]);

    const handleNotifToggle = (key: string, enabled: boolean) => {
        const updated = { ...notifPrefs, [key]: enabled };
        setNotifPrefs(updated);
        setNotificationPrefs(updated);
    };

    const handlePushToggle = async (enabled: boolean) => {
        if (enabled) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast.error('Notification permission denied. Enable it in browser settings.');
                return;
            }
        }
        setPushEnabled(enabled);
        localStorage.setItem('push-enabled', String(enabled));
        toast.success(enabled ? 'Push notifications enabled' : 'Push notifications disabled');
    };

    const handleTimezoneSelect = (tz: string) => {
        setTimezone(tz);
        setTzSearch('');
    };

    const themes: { value: Appearance; label: string; icon: typeof Sun; desc: string }[] = [
        { value: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
        { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
        { value: 'system', label: 'System', icon: Monitor, desc: 'Match your device' },
    ];

    return (
        <div className="space-y-5">
            {/* Timezone */}
            <SectionCard icon={Globe} iconBg="bg-sky-50 text-sky-600" title="Timezone" description="Times will be displayed in your selected timezone">
                <div className="max-w-md space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search timezones..."
                            value={tzSearch}
                            onChange={(e) => setTzSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50">
                        {filteredTimezones.map((tz) => (
                            <button
                                key={tz}
                                onClick={() => handleTimezoneSelect(tz)}
                                className={cn(
                                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-white',
                                    tz === timezone && 'bg-white font-medium text-blue-600',
                                )}
                            >
                                <span>{tz.replace(/_/g, ' ')}</span>
                                <span className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{formatTimezoneOffset(tz)}</span>
                                    {tz === timezone && <Check className="h-3.5 w-3.5 text-blue-600" />}
                                </span>
                            </button>
                        ))}
                        {filteredTimezones.length === 0 && (
                            <p className="px-3 py-4 text-center text-sm text-gray-400">No timezones found</p>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* Notifications */}
            <SectionCard icon={Bell} iconBg="bg-violet-50 text-violet-600" title="Notifications" description="Control how you receive notifications">
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <div>
                            <Label className="text-sm font-medium">Push Notifications</Label>
                            <p className="text-xs text-gray-500">Receive alerts even when the app is in the background</p>
                        </div>
                        <Switch checked={pushEnabled} onCheckedChange={handlePushToggle} />
                    </div>

                    <div className="space-y-1">
                        {NOTIFICATION_CATEGORIES.map((cat) => (
                            <div key={cat.key} className="flex items-center justify-between px-4 py-2.5">
                                <div>
                                    <Label className="text-sm">{cat.label}</Label>
                                    <p className="text-xs text-gray-500">{cat.description}</p>
                                </div>
                                <Switch
                                    checked={notifPrefs[cat.key] ?? true}
                                    onCheckedChange={(v) => handleNotifToggle(cat.key, v)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* Theme */}
            <SectionCard icon={Sun} iconBg="bg-orange-50 text-orange-600" title="Appearance" description="Choose your preferred color scheme">
                <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => {
                        const Icon = t.icon;
                        const isActive = appearance === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => updateAppearance(t.value)}
                                className={cn(
                                    'relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 transition-all',
                                    isActive
                                        ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                                        : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50',
                                )}
                            >
                                {isActive && (
                                    <div className="absolute right-1.5 top-1.5 rounded-full bg-blue-500 p-0.5">
                                        <Check className="h-2.5 w-2.5 text-white" />
                                    </div>
                                )}
                                <Icon className={cn('h-6 w-6', isActive ? 'text-blue-600' : 'text-gray-400')} />
                                <span className={cn('text-sm font-medium', isActive ? 'text-blue-700' : 'text-gray-700')}>{t.label}</span>
                                <span className="text-[11px] text-gray-400">{t.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}
