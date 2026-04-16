import { 
  FiHexagon, FiActivity, FiUser, FiZap 
} from 'react-icons/fi';
import { 
  MdSportsBaseball, MdSportsBasketball, MdSportsFootball, MdSportsHandball, 
  MdSportsHockey, MdSportsKabaddi, MdSportsMotorsports, MdSportsRugby, 
  MdSportsSoccer, MdSportsTennis, MdSportsVolleyball, MdPool, MdDirectionsRun 
} from 'react-icons/md';

export interface SportTheme {
    id: string;
    name: string;
    icon: any;
    color: string;
    bgLight: string;
    bgDark: string;
    accent: string;
}

export const SPORT_THEMES: Record<string, SportTheme> = {
    football: {
        id: 'football',
        name: 'Football',
        icon: MdSportsFootball,
        color: '#f8c231', // Unill Yellow
        bgLight: 'rgba(248, 194, 49, 0.1)',
        bgDark: 'rgba(248, 194, 49, 0.2)',
        accent: '#b45309'
    },
    basketball: {
        id: 'basketball',
        name: 'Basketball',
        icon: MdSportsBasketball,
        color: '#f97316', // Orange
        bgLight: 'rgba(249, 115, 22, 0.1)',
        bgDark: 'rgba(249, 115, 22, 0.2)',
        accent: '#c2410c'
    },
    volleyball: {
        id: 'volleyball',
        name: 'Volleyball',
        icon: MdSportsVolleyball,
        color: '#8b5cf6', // Violet
        bgLight: 'rgba(139, 92, 246, 0.1)',
        bgDark: 'rgba(139, 92, 246, 0.2)',
        accent: '#6d28d9'
    },
    rugby: {
        id: 'rugby',
        name: 'Rugby',
        icon: MdSportsRugby,
        color: '#ef4444', // Red
        bgLight: 'rgba(239, 68, 68, 0.1)',
        bgDark: 'rgba(239, 68, 68, 0.2)',
        accent: '#b91c1c'
    },
    athletics: {
        id: 'athletics',
        name: 'Athletics',
        icon: MdDirectionsRun,
        color: '#10b981', // Emerald
        bgLight: 'rgba(16, 185, 129, 0.1)',
        bgDark: 'rgba(16, 185, 129, 0.2)',
        accent: '#047857'
    },
    swimming: {
        id: 'swimming',
        name: 'Swimming',
        icon: MdPool,
        color: '#0ea5e9', // Sky
        bgLight: 'rgba(14, 165, 233, 0.1)',
        bgDark: 'rgba(14, 165, 233, 0.2)',
        accent: '#0369a1'
    },
    tennis: {
        id: 'tennis',
        name: 'Tennis',
        icon: MdSportsTennis,
        color: '#84cc16', // Lime
        bgLight: 'rgba(132, 204, 22, 0.1)',
        bgDark: 'rgba(132, 204, 22, 0.2)',
        accent: '#4d7c0f'
    },
    hockey: {
        id: 'hockey',
        name: 'Hockey',
        icon: MdSportsHockey,
        color: '#06b6d4', // Cyan
        bgLight: 'rgba(6, 182, 212, 0.1)',
        bgDark: 'rgba(6, 182, 212, 0.2)',
        accent: '#0e7490'
    }
};

export const getSportTheme = (sportId: string): SportTheme => {
    return SPORT_THEMES[sportId.toLowerCase()] || {
        id: sportId,
        name: sportId,
        icon: FiActivity,
        color: '#94a3b8',
        bgLight: 'rgba(148, 163, 184, 0.1)',
        bgDark: 'rgba(148, 163, 184, 0.2)',
        accent: '#475569'
    };
};
