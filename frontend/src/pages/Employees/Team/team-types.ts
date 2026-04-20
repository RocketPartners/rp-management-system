import { Crown, Shield, Users } from 'lucide-react';

export interface TeamMember {
    userId: number;
    userName: string;
    email: string;
    position: string | null;
    department: string | null;
    roleInTeam: string;
    isPrimary?: boolean;
}

export interface TeamData {
    id: number;
    name: string;
    description: string | null;
    leaderName: string | null;
    subLeaderName: string | null;
    status: string;
    membersCount: number;
    members: TeamMember[] | null;
}

export const roleConfig: Record<string, { label: string; icon: typeof Crown; color: string }> = {
    LEAD: { label: 'Team Lead', icon: Crown, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    SUB_LEAD: { label: 'Sub Lead', icon: Shield, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    MEMBER: { label: 'Member', icon: Users, color: 'bg-gray-100 text-gray-600 border-gray-200' },
};
