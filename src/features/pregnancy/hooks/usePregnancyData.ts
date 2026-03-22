/**
 * features/pregnancy/hooks/usePregnancyData.ts
 * Single hook consumed by all pregnancy screens.
 */

import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  usePregnancyStore,
  selectPregnancy, selectAppointments, selectExams,
  selectJournal, selectWeightEntries, selectChecklist,
  selectPregnancyActions, selectSortedAppointments,
  selectSortedExams, selectSortedJournal, selectSortedWeight,
} from '@store/pregnancyStore';
import {
  computeProgress, computeWeightGain, getWeeklyContent, genId,
} from '../utils/pregnancyCalc';
import type {
  AppointmentFormValues, ExamFormValues,
  JournalEntryFormValues, WeightEntryFormValues,
} from '../types';
import type { Appointment, MedicalExam, PregnancyJournalEntry, WeightEntry } from '@types/models';

export function usePregnancyData() {
  const pregnancy     = usePregnancyStore(selectPregnancy);
  const appointments  = usePregnancyStore(selectSortedAppointments);
  const exams         = usePregnancyStore(selectSortedExams);
  const journal       = usePregnancyStore(selectSortedJournal);
  const weightEntries = usePregnancyStore(selectSortedWeight);
  const checklist     = usePregnancyStore(selectChecklist);
  const actions       = usePregnancyStore(selectPregnancyActions);

  // Seed on first mount
  useEffect(() => { actions.seed(); }, []);

  // Derived
  const progress = useMemo(
    () => pregnancy ? computeProgress(pregnancy) : null,
    [pregnancy],
  );

  const weeklyContent = useMemo(
    () => pregnancy ? getWeeklyContent(pregnancy.currentWeek) : null,
    [pregnancy?.currentWeek],
  );

  const weightGain = useMemo(
    () => computeWeightGain(weightEntries),
    [weightEntries],
  );

  const nextAppointment = useMemo(
    () => appointments.find(a => !a.isCompleted) ?? null,
    [appointments],
  );

  const upcomingExams = useMemo(
    () => exams.filter(e => !e.isCompleted),
    [exams],
  );

  const checklistProgress = useMemo(() => {
    const done  = checklist.filter(c => c.isDone).length;
    const total = checklist.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [checklist]);

  // ── Form actions ──────────────────────────────────────────

  function saveAppointment(values: AppointmentFormValues, editId?: string) {
    const datetime = `${values.date}T${values.time}:00`;
    const now      = new Date().toISOString();

    if (editId) {
      actions.updateAppointment(editId, {
        title:           values.title,
        date:            datetime,
        location:        values.location,
        doctorName:      values.doctorName,
        speciality:      values.speciality,
        notes:           values.notes,
        reminderEnabled: values.reminderEnabled,
        reminderMinutes: values.reminderMinutes,
      });
    } else {
      const apt: Appointment = {
        id:              genId('apt'),
        title:           values.title,
        date:            datetime,
        location:        values.location,
        doctorName:      values.doctorName,
        speciality:      values.speciality,
        notes:           values.notes,
        reminderEnabled: values.reminderEnabled,
        reminderMinutes: values.reminderMinutes,
        isCompleted:     false,
        phase:           'pregnancy',
        createdAt:       now,
      };
      actions.addAppointment(apt);
    }
  }

  function saveExam(values: ExamFormValues, editId?: string) {
    const now = new Date().toISOString();
    if (editId) {
      actions.updateExam(editId, {
        type:          values.type,
        scheduledDate: values.scheduledDate,
        labName:       values.labName,
        doctorName:    values.doctorName,
        result:        values.result,
        notes:         values.notes,
        isCompleted:   values.isCompleted,
        completedDate: values.completedDate,
      });
    } else {
      const exam: MedicalExam = {
        id:            genId('ex'),
        type:          values.type,
        scheduledDate: values.scheduledDate,
        labName:       values.labName,
        doctorName:    values.doctorName,
        result:        values.result,
        notes:         values.notes,
        isCompleted:   values.isCompleted,
        completedDate: values.completedDate,
        phase:         'pregnancy',
        createdAt:     now,
      };
      actions.addExam(exam);
    }
  }

  function saveJournalEntry(values: JournalEntryFormValues, editId?: string) {
    const now = new Date().toISOString();
    if (editId) {
      actions.updateJournalEntry(editId, {
        date:    values.date,
        content: values.content,
        mood:    values.mood as any,
        tags:    values.tags,
      });
    } else {
      const entry: PregnancyJournalEntry = {
        id:        genId('jrn'),
        date:      values.date,
        week:      pregnancy?.currentWeek ?? 0,
        content:   values.content,
        mood:      (values.mood ?? 4) as any,
        tags:      values.tags,
        createdAt: now,
      };
      actions.addJournalEntry(entry);
    }
  }

  function saveWeightEntry(values: WeightEntryFormValues, editId?: string) {
    const now = new Date().toISOString();
    if (editId) {
      actions.updateWeightEntry(editId, {
        date:     values.date,
        weightKg: values.weightKg,
        notes:    values.notes,
      });
    } else {
      const entry: WeightEntry = {
        id:       genId('w'),
        date:     values.date,
        weightKg: values.weightKg,
        notes:    values.notes,
        phase:    'pregnancy',
        createdAt: now,
      };
      actions.addWeightEntry(entry);
    }
  }

  function getAppointmentById(id: string) {
    return appointments.find(a => a.id === id);
  }

  function getExamById(id: string) {
    return exams.find(e => e.id === id);
  }

  function getJournalEntryById(id: string) {
    return journal.find(e => e.id === id);
  }

  function getWeightEntryById(id: string) {
    return weightEntries.find(e => e.id === id);
  }

  return {
    // State
    pregnancy,
    appointments,
    exams,
    journal,
    weightEntries,
    checklist,
    // Derived
    progress,
    weeklyContent,
    weightGain,
    nextAppointment,
    upcomingExams,
    checklistProgress,
    // Raw actions
    actions,
    // Form actions
    saveAppointment,
    saveExam,
    saveJournalEntry,
    saveWeightEntry,
    // Queries
    getAppointmentById,
    getExamById,
    getJournalEntryById,
    getWeightEntryById,
  };
}
