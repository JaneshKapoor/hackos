import { Role, RegistrationStatus, AnnouncementTarget, JudgingRound } from '@prisma/client';

export type { Role, RegistrationStatus, AnnouncementTarget, JudgingRound };

export interface EventWithDetails {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    bannerImage: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date | null;
    submissionOpenAt: Date | null;
    submissionDeadline: Date | null;
    maxTeamSize: number;
    requiresApproval: boolean;
    isPublished: boolean;
    submissionsOpen: boolean;
    livePitchingActive: boolean;
    currentPitchTeamId: string | null;
    resultsPublic: boolean;
    _count?: {
        registrations: number;
        submissions: number;
    };
}

export interface RegistrationFormData {
    teamName: string;
    isTeam: boolean;
    leader: {
        name: string;
        email: string;
        linkedinUrl: string;
        bio: string;
        selfie: string | null;
    };
    members: {
        name: string;
        email: string;
        linkedinUrl: string;
        bio: string;
    }[];
}

export interface ParticipantWithUser {
    id: string;
    isTeamLead: boolean;
    selfieUrl: string | null;
    linkedinUrl: string | null;
    bio: string | null;
    isPresent: boolean;
    goodieReceived: boolean;
    qrToken: string;
    networkingPoints: number;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    registration: {
        id: string;
        teamName: string | null;
        status: RegistrationStatus;
    };
}

export interface ScoreData {
    technicalImpl: number;
    techStack: number;
    innovation: number;
    impact: number;
    presentation: number;
    notes?: string;
}

export interface DashboardStats {
    totalRegistrations: number;
    approved: number;
    present: number;
    submissions: number;
    pendingReview: number;
    teamsFormed: number;
}
