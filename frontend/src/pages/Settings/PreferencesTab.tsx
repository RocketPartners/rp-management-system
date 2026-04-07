import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    try {
        return localStorage.getItem('push-enabled') !== 'false';
    } catch {
        return true;
    }
}

const ALL_TIMEZONES = (() => {
    try {
        return Intl.supportedValuesOf('timeZone');
    } catch {
        return ['America/New_York', 'Europe/London', 'Europe/Madrid', 'Asia/Manila', 'Asia/Tokyo', 'Australia/Sydney'];
    }
})();

function formatTimezoneOffset(tz: string): string {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'shortOffset',
        });
        const parts = formatter.formatToParts(now);
        const offsetPart = parts.find((p) => p.type === 'timeZoneName');
        return offsetPart?.value || '';
    } catch {
        return '';
    }
}

export default function PreferencesTab() {
    const { timezone, setTimezone } = useTimezone();
    const { appearance, updateAppearance } = useAppearance();
    const [notifPrefs, setNotifPrefs] = useState(getNotificationPrefs);
    const [pushEnabled, setPushEnabled] = useState(getPushEnabled);
    const [tzSearch, setTzSearch] = useState('');

    const filteredTimezones = useMemo(() => {
        if (!tzSearch) return ALL_TIMEZONES.slice(0, 20);
        const q = tzSearch.toLowerCase();
        return ALL_TIMEZONES.filter((tz) => tz.toLowerCase().includes(q)).slice(0, 20);
    }, [tzSearch]);

    const handleNotifToggle = (key: string, enabled: boolean) => {
        const updated = { ...notifPrefs, [key]: enabled };
        setNotifPrefs(updated);
        setNotificationPrefs(updated);
        toast.success(`${enabled ? 'Enabled' : 'Disabled'} ${key} notifications`);
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
        toast.success(`Timezone set to ${tz}`);
    };

    const themes: { value: Appearance; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <div className="space-y-6">
            {/* Timezone */}
            <Card>
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Timezone</h2>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Times throughout the app will be displayed in your selected timezone.
                    </p>
                    <div className="max-w-md space-y-2">
                        <Input
                            placeholder="Search timezones..."
                            value={tzSearch}
                            onChange={(e) => setTzSearch(e.target.value)}
                        />
                        <div className="max-h-48 overflow-y-auto rounded-md border">
                            {filteredTimezones.map((tz) => (
                                <button
                                    key={tz}
                                    onClick={() => handleTimezoneSelect(tz)}
                                    className={cn(
                                        'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent',
                                        tz === timezone && 'bg-accent font-medium',
                                    )}
                                >
                                    <span>{tz.replace(/_/g, ' ')}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTimezoneOffset(tz)}
                                    </span>
                                </button>
                            ))}
                            {filteredTimezones.length === 0 && (
                                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    No timezones found
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current: <strong>{timezone.replace(/_/g, ' ')}</strong> ({formatTimezoneOffset(timezone)})
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Notifications</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Push toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">
                                    Receive browser notifications even when the app is in the background
                                </p>
                            </div>
                            <Switch
                                checked={pushEnabled}
                                onCheckedChange={handlePushToggle}
                            />
                        </div>

                        <hr />

                        {/* Per-category toggles */}
                        <div>
                            <p className="mb-3 text-sm font-medium">Notification Categories</p>
                            <div className="space-y-4">
                                {NOTIFICATION_CATEGORIES.map((cat) => (
                                    <div key={cat.key} className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm">{cat.label}</Label>
                                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                                        </div>
                                        <Switch
                                            checked={notifPrefs[cat.key] ?? true}
                                            onCheckedChange={(v) => handleNotifToggle(cat.key, v)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theme */}
            <Card>
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Sun className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Appearance</h2>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Choose your preferred color scheme.
                    </p>
                    <div className="flex gap-3">
                        {themes.map((t) => {
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.value}
                                    onClick={() => {
                                        updateAppearance(t.value);
                                        toast.success(`Theme set to ${t.label}`);
                                    }}
                                    className={cn(
                                        'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                                        appearance === t.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-transparent bg-muted/50 hover:bg-muted',
                                    )}
                                >
                                    <Icon className="h-6 w-6" />
                                    <span className="text-sm font-medium">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
