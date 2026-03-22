/**
 * features/postpartum/hooks/usePostpartumData.ts
 * Unified data hook — postpartum module.
 */

import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  useBabyStore,
  selectActiveBaby, selectSortedPostpartum, selectBabyActions,
  selectVaccineRecords, selectAllGrowthEntries, selectHealthNotes,
} from '@store/babyStore';
import { getBabyAge, todayISO } from '@utils/date';
import type { PostpartumEntry, BabyProfile, GrowthEntry } from '@types/models';
import type { HealthNote } from '../types';
import type { PostpartumEntryFormValues, GrowthEntryFormValues, HealthNoteFormValues } from '../types';

// ─── id generator ────────────────────────────────────────────

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────────────────────────────────────────
//  POSTPARTUM HOOK
// ─────────────────────────────────────────────────────────────

export function usePostpartumData() {
  const baby           = useBabyStore(selectActiveBaby);
  const postpartum     = useBabyStore(selectSortedPostpartum);
  const vaccineRecords = useBabyStore(selectVaccineRecords);
  const actions        = useBabyStore(selectBabyActions);

  useEffect(() => { actions.seed(); }, []);

  const babyAge     = baby ? getBabyAge(baby.birthDate) : null;
  const nextVaccine = baby ? actions.getNextVaccine(baby.id) : undefined;
  const todayEntry  = postpartum.find(e => e.date === todayISO()) ?? null;

  // Average mood over last 7 days
  const recentMood = useMemo(() => {
    const recent = postpartum.slice(0, 7).filter(e => typeof e.mood === 'number');
    if (recent.length === 0) return null;
    return Math.round((recent.reduce((s, e) => s + e.mood, 0) / recent.length) * 10) / 10;
  }, [postpartum]);

  function saveEntry(values: PostpartumEntryFormValues, editId?: string) {
    const now = new Date().toISOString();
    if (editId) {
      actions.updatePostpartumEntry(editId, {
        date:            values.date,
        mood:            values.mood as any,
        fatigue:         values.fatigue as any,
        pain:            values.pain as any,
        symptoms:        values.symptoms as any,
        isBreastfeeding: values.isBreastfeeding,
        notes:           values.notes,
      });
    } else {
      const entry: PostpartumEntry = {
        id:              genId('pp'),
        date:            values.date,
        mood:            (values.mood ?? 3) as any,
        fatigue:         (values.fatigue ?? 3) as any,
        pain:            (values.pain ?? 0) as any,
        symptoms:        (values.symptoms ?? []) as any,
        isBreastfeeding: values.isBreastfeeding,
        notes:           values.notes,
        createdAt:       now,
      };
      actions.addPostpartumEntry(entry);
    }
  }

  function deleteEntry(id: string) {
    actions.deletePostpartumEntry(id);
  }

  function getEntryById(id: string) {
    return postpartum.find(e => e.id === id);
  }

  return {
    baby, babyAge, postpartum, nextVaccine,
    todayEntry, recentMood, actions,
    saveEntry, deleteEntry, getEntryById,
  };
}

// ─────────────────────────────────────────────────────────────
//  BABY HOOK
// ─────────────────────────────────────────────────────────────

export function useBabyData(babyId?: string) {
  const babies      = useBabyStore(s => s.babies);
  const actions     = useBabyStore(selectBabyActions);

  useEffect(() => { actions.seed(); }, []);

  const baby = babyId
    ? babies.find(b => b.id === babyId) ?? null
    : (useBabyStore(selectActiveBaby));

  const babyAge        = baby ? getBabyAge(baby.birthDate) : null;
  const growthEntries  = baby ? actions.getGrowthForBaby(baby.id) : [];
  const latestGrowth   = baby ? actions.getLatestGrowth(baby.id) : undefined;
  const vaccineRecords = useBabyStore(selectVaccineRecords).filter(v => v.babyId === (baby?.id ?? ''));
  const nextVaccine    = baby ? actions.getNextVaccine(baby.id) : undefined;
  const healthNotes    = baby ? actions.getHealthNotes(baby.id) : [];

  // Growth summary
  const growthSummary = useMemo(() => {
    if (!latestGrowth || !baby) return null;
    const birthWeight = baby.birthWeightGrams ?? null;
    const birthHeight = baby.birthHeightCm ?? null;
    return {
      latestWeight:  latestGrowth.weightGrams,
      latestHeight:  latestGrowth.heightCm,
      latestHead:    latestGrowth.headCircumferenceCm,
      latestDate:    latestGrowth.date,
      gainFromBirth: birthWeight != null && birthHeight != null
        ? { weightGrams: latestGrowth.weightGrams - birthWeight, heightCm: latestGrowth.heightCm - birthHeight }
        : null,
    };
  }, [latestGrowth, baby]);

  // ── Mutations ────────────────────────────────────────────

  function updateProfile(values: Partial<BabyProfile>) {
    if (baby) actions.updateBaby(baby.id, values);
  }

  function saveGrowthEntry(values: GrowthEntryFormValues, editId?: string) {
    if (!baby) return;
    const now = new Date().toISOString();
    if (editId) {
      actions.updateGrowthEntry(editId, {
        date:               values.date,
        weightGrams:        values.weightGrams,
        heightCm:           values.heightCm,
        headCircumferenceCm: values.headCircumferenceCm,
        measuredBy:         values.measuredBy,
        notes:              values.notes,
      });
    } else {
      const entry: GrowthEntry = {
        id:                  genId('gr'),
        babyId:              baby.id,
        date:                values.date,
        ageMonths:           getBabyAge(baby.birthDate).totalMonths,
        weightGrams:         values.weightGrams,
        heightCm:            values.heightCm,
        headCircumferenceCm: values.headCircumferenceCm,
        measuredBy:          values.measuredBy,
        notes:               values.notes,
        createdAt:           now,
      };
      actions.addGrowthEntry(entry);
    }
  }

  function deleteGrowthEntry(id: string) {
    actions.deleteGrowthEntry(id);
  }

  function saveHealthNote(values: HealthNoteFormValues, editId?: string) {
    if (!baby) return;
    const now = new Date().toISOString();
    if (editId) {
      actions.updateHealthNote(editId, { ...values, category: values.category as HealthNote['category'] });
    } else {
      const note: HealthNote = {
        id:        genId('hn'),
        babyId:    baby.id,
        date:      values.date,
        category:  values.category as HealthNote['category'],
        content:   values.content,
        createdAt: now,
      };
      actions.addHealthNote(note);
    }
  }

  function deleteHealthNote(id: string) {
    actions.deleteHealthNote(id);
  }

  function getGrowthEntryById(id: string) {
    return growthEntries.find(g => g.id === id);
  }

  function getHealthNoteById(id: string) {
    return healthNotes.find(n => n.id === id);
  }

  return {
    baby, babies, babyAge, growthEntries, latestGrowth,
    vaccineRecords, nextVaccine, healthNotes, growthSummary, actions,
    updateProfile, saveGrowthEntry, deleteGrowthEntry,
    saveHealthNote, deleteHealthNote, getGrowthEntryById, getHealthNoteById,
  };
}
