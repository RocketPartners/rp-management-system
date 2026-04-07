import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import PreferencesTab from './PreferencesTab';

export default function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    return (
        <>
            <Helmet>
                <title>Settings | HRIS</title>
            </Helmet>

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setSearchParams({ tab: v })}
                >
                    <TabsList>
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="gap-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6">
                        <ProfileTab />
                    </TabsContent>
                    <TabsContent value="security" className="mt-6">
                        <SecurityTab />
                    </TabsContent>
                    <TabsContent value="preferences" className="mt-6">
                        <PreferencesTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
