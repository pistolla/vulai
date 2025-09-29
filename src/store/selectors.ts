import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';

export const selectAuth = (s: RootState) => s.auth;

export const selectRole = createSelector([selectAuth], (a) => a.user?.role);

/* per-role scoped selectors */
export const selectAdmin = (s: RootState) => s.admin;
export const selectCorrespondent = (s: RootState) => s.correspondent;
export const selectFan = (s: RootState) => s.fan;
export const selectSportTeam = (s: RootState) => s.sportTeam;

export const selectActiveCommentary = (s: RootState) => s.correspondent.activeCommentary;
export const selectFixtureVideo = (fixtureId: string) => (s: RootState) =>
  s.correspondent.fixtureVideos[fixtureId];
