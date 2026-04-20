import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Crown, Shield, Users, Building2, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiGet } from '@/lib/spring-boot-api';
import { TeamData, roleConfig } from './team-types';

function TeamCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function MyTeams() {
    const { data: teams, isLoading, isError, error } = useQuery({
        queryKey: ['my-teams'],
        queryFn: () => apiGet<TeamData[]>('/users/me/teams'),
        staleTime: 5 * 60 * 1000,
    });

    return (
        <>
            <Helmet><title>My Teams | HRIS</title></Helmet>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Teams</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {isLoading
                                ? 'Loading...'
                                : teams && teams.length > 0
                                    ? `You belong to ${teams.length} ${teams.length === 1 ? 'team' : 'teams'}`
                                    : 'You are not assigned to any team'}
                        </p>
                    </div>

                    {isLoading && (
                        <div className="grid gap-5 md:grid-cols-2">
                            <TeamCardSkeleton />
                            <TeamCardSkeleton />
                        </div>
                    )}

                    {!isLoading && isError && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <p className="text-sm font-medium text-red-600">Failed to load teams</p>
                                <p className="mt-1 text-xs text-red-400">
                                    {error?.message || 'Please try again later.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && !isError && (!teams || teams.length === 0) && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="mb-3 h-10 w-10 text-gray-300" />
                                <p className="text-sm font-medium text-gray-500">No teams assigned</p>
                                <p className="mt-1 text-xs text-gray-400">Contact your manager or HR to get assigned to a team.</p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && teams && teams.length > 0 && (
                        <div className="grid gap-5 md:grid-cols-2">
                            {teams.map((team) => (
                                    <Card key={team.id} className="flex flex-col">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-lg">{team.name}</CardTitle>
                                                <Badge variant="outline" className="shrink-0 bg-green-50 text-green-700 border-green-200">
                                                    {team.membersCount} {team.membersCount === 1 ? 'member' : 'members'}
                                                </Badge>
                                            </div>
                                            {team.description && (
                                                <p className="text-sm text-gray-500">{team.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-3 pt-1 text-sm">
                                                {team.leaderName && (
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                                                        <span className="font-medium">Lead:</span> {team.leaderName}
                                                    </span>
                                                )}
                                                {team.subLeaderName && (
                                                    <span className="flex items-center gap-1 text-gray-600">
                                                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="font-medium">Sub:</span> {team.subLeaderName}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-1 space-y-2 pt-0">
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Members
                                            </h3>
                                            <div className="space-y-2">
                                                {team.members?.map((member) => {
                                                    const config = roleConfig[member.roleInTeam] || roleConfig.MEMBER;
                                                    const Icon = config.icon;
                                                    const initials = member.userName
                                                        ?.split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2);

                                                    return (
                                                        <div key={member.userId} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50/50">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white">
                                                                    {initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                                        {member.userName}
                                                                    </p>
                                                                    <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                                                                        <Icon className="mr-0.5 h-2.5 w-2.5" />
                                                                        {config.label}
                                                                    </Badge>
                                                                </div>
                                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                                                                    {member.position && (
                                                                        <span className="flex items-center gap-0.5">
                                                                            <Briefcase className="h-2.5 w-2.5" />
                                                                            {member.position}
                                                                        </span>
                                                                    )}
                                                                    {member.department && (
                                                                        <span className="flex items-center gap-0.5">
                                                                            <Building2 className="h-2.5 w-2.5" />
                                                                            {member.department}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
