/**
 * features/cycle/hooks/useCycleData.ts
 *
 * Single hook consumed by all cycle screens.
 * Seeds mock data on first use, computes derived values,
 * and exposes typed actions. Screens never import stores directly.
 */

import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';

import {
  useCycleStore,
  selectCycleEntries, selectSymptoms, selectPrediction, selectCycleActions,
} from '@store/cycleStore';
import {
  useCycleNoteStore,
  selectNotes, selectNoteActions,
} from '../store/cycleNoteStore';
import {
  MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS,
} from '@services/mocks/dashboardData';
import {
  computeCycleStats, getTodayCycleStatus, buildCalendarMonth, buildCalendarGrid, genId,
} from '../utils/cycleCalc';
import type { CycleEntry, SymptomEntry } from '@types/models';
import type { AddPeriodFormValues, AddSymptomsFormValues } from '../types';

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useCycleData() {
  // ── Stores ──────────────────────────────────────────────────
  const entries    = useCycleStore(selectCycleEntries);
  const symptoms   = useCycleStore(selectSymptoms);
  const prediction = useCycleStore(selectPrediction);
  const cycleAct   = useCycleStore(selectCycleActions);

  const notes      = useCycleNoteStore(selectNotes);
  const noteAct    = useCycleNoteStore(selectNoteActions);

  // ── Seed on first load ──────────────────────────────────────
  useEffect(() => {
    if (entries.length === 0) {
      cycleAct.seed(MOCK_CYCLE_ENTRIES, MOCK_SYMPTOMS);
    }
    noteAct.seed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ──────────────────────────────────────────
  const stats = useMemo(
    () => computeCycleStats(entries, symptoms),
    [entries, symptoms],
  );

  const todayStatus = useMemo(
    () => getTodayCycleStatus(entries, prediction),
    [entries, prediction],
  );

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [entries],
  );

  const sortedSymptoms = useMemo(
    () => [...symptoms].sort((a, b) => b.date.localeCompare(a.date)),
    [symptoms],
  );

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.date.localeCompare(a.date)),
    [notes],
  );

  // ── Calendar builder ────────────────────────────────────────
  function getCalendarMonth(year: number, month: number) {
    const days = buildCalendarMonth(year, month, entries, symptoms, notes, prediction);
    return { days, grid: buildCalendarGrid(days) };
  }

  // ── Actions ─────────────────────────────────────────────────

  function savePeriod(values: AddPeriodFormValues, editId?: string): void {
    const now = new Date().toISOString();
    if (editId) {
      cycleAct.updateEntry(editId, {
        startDate:    values.startDate,
        endDate:      values.endDate,
        durationDays: values.endDate
          ? Math.round((new Date(values.endDate).getTime() - new Date(values.startDate).getTime()) / 86_400_000) + 1
          : undefined,
        flow:    values.flow,
        notes:   values.notes,
        updatedAt: now,
      });
    } else {
      const entry: CycleEntry = {
        id:          genId('cy'),
        startDate:   values.startDate,
        endDate:     values.endDate,
        durationDays: values.endDate
          ? Math.round((new Date(values.endDate).getTime() - new Date(values.startDate).getTime()) / 86_400_000) + 1
          : undefined,
        flow:        values.flow,
        notes:       values.notes,
        createdAt:   now,
      };
      cycleAct.addEntry(entry);
    }
  }

  function saveSymptoms(values: AddSymptomsFormValues, editId?: string): void {
    const now = new Date().toISOString();
    if (editId) {
      cycleAct.updateSymptom(editId, {
        date:     values.date,
        symptoms: values.symptoms as SymptomEntry['symptoms'],
        mood:     values.mood as SymptomEntry['mood'],
        fatigue:  values.fatigue as SymptomEntry['fatigue'],
        pain:     values.pain as SymptomEntry['pain'],
        flow:     values.flow,
        notes:    values.notes,
        updatedAt: now,
      });
    } else {
      const entry: SymptomEntry = {
        id:       genId('sy'),
        date:     values.date,
        symptoms: values.symptoms as SymptomEntry['symptoms'],
        mood:     (values.mood ?? 3) as SymptomEntry['mood'],
        fatigue:  (values.fatigue ?? 3) as SymptomEntry['fatigue'],
        pain:     (values.pain ?? 0) as SymptomEntry['pain'],
        flow:     values.flow,
        notes:    values.notes,
        createdAt: now,
      };
      cycleAct.addSymptom(entry);
    }
  }

  function saveNote(date: string, text: string) {
    return noteAct.upsertNote(date, text);
  }

  function deletePeriod(id: string) {
    cycleAct.deleteEntry(id);
  }

  function deleteSymptomEntry(id: string) {
    cycleAct.deleteSymptom(id);
  }

  function deleteNote(id: string) {
    noteAct.deleteNote(id);
  }

  function getSymptomByDate(date: string) {
    return cycleAct.getSymptomByDate(date);
  }

  function getNoteByDate(date: string) {
    return noteAct.getNoteByDate(date);
  }

  function getEntryById(id: string) {
    return entries.find(e => e.id === id);
  }

  function getSymptomById(id: string) {
    return symptoms.find(s => s.id === id);
  }

  return {
    // Raw data
    entries,
    symptoms,
    prediction,
    notes,
    // Derived
    stats,
    todayStatus,
    sortedEntries,
    sortedSymptoms,
    sortedNotes,
    // Calendar
    getCalendarMonth,
    // Queries
    getSymptomByDate,
    getNoteByDate,
    getEntryById,
    getSymptomById,
    // Mutations
    savePeriod,
    saveSymptoms,
    saveNote,
    deletePeriod,
    deleteSymptomEntry,
    deleteNote,
  };
}
