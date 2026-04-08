import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, SlidersHorizontal, Settings } from 'lucide-react';
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

            {/* Page header — matches Dashboard/Announcements pattern */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                            <Settings className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-500">
                                Manage your account, security, and preferences
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setSearchParams({ tab: v })}
                >
                    <TabsList>
                        <TabsTrigger value="profile" className="gap-1.5">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-1.5">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="gap-1.5">
                            <SlidersHorizontal className="h-4 w-4" />
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 max-w-4xl">
                        <TabsContent value="profile">
                            <ProfileTab />
                        </TabsContent>
                        <TabsContent value="security">
                            <SecurityTab />
                        </TabsContent>
                        <TabsContent value="preferences">
                            <PreferencesTab />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </>
    );
}
