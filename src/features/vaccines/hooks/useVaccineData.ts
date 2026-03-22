/**
 * features/vaccines/hooks/useVaccineData.ts
 *
 * Single hook consumed by all vaccine screens.
 *
 * Wires together:
 *   - vaccineStore (user records)
 *   - babyStore (active baby profile)
 *   - scheduleRegistry (country definitions)
 *   - vaccineCalc (status computation)
 */

import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';

import { useBabyStore, selectActiveBaby } from '@store/babyStore';
import { useVaccineStore, selectVaccineActions, selectVaccineRecords } from '@store/vaccineStore';
import { useAuthStore, selectUser } from '@store/authStore';
import { getSchedule } from '../services/scheduleRegistry';
import {
  computeAllStatuses, sortResults, groupBySeries,
  filterByStatus, getUpcoming, getDone,
  computeStats, computeScheduledDate, genId,
} from '../utils/vaccineCalc';
import type { VaccineRecord } from '@types/models';
import type { RecordVaccineFormValues, VaccineStatusResult } from '../types';

// ─────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────

export function useVaccineData(babyId?: string) {
  const user       = useAuthStore(selectUser);
  const allBabies  = useBabyStore(s => s.babies);
  const activeBaby = useBabyStore(selectActiveBaby);
  const baby       = babyId
    ? (allBabies.find(b => b.id === babyId) ?? activeBaby)
    : activeBaby;

  const allRecords = useVaccineStore(selectVaccineRecords);
  const vaccineAct = useVaccineStore(selectVaccineActions);
  const babyAct    = useBabyStore(s => s.actions);

  // Seed both stores on first use
  useEffect(() => {
    babyAct.seed();
    vaccineAct.seed();
  }, []);

  // Country schedule
  const country    = baby?.id ? (user?.country ?? 'FR') : 'FR';
  const schedule   = useMemo(() => getSchedule(country), [country]);

  // Baby-specific records
  const records = useMemo(
    () => allRecords.filter(r => r.babyId === (baby?.id ?? '')),
    [allRecords, baby?.id],
  );

  // All statuses computed
  const allStatuses = useMemo(() => {
    if (!baby) return [];
    return computeAllStatuses(schedule.definitions, baby.birthDate, records);
  }, [schedule, baby?.birthDate, records]);

  // Derived views
  const sorted     = useMemo(() => sortResults(allStatuses), [allStatuses]);
  const groups     = useMemo(() => groupBySeries(allStatuses), [allStatuses]);
  const upcoming   = useMemo(() => getUpcoming(allStatuses), [allStatuses]);
  const history    = useMemo(() => getDone(allStatuses), [allStatuses]);
  const stats      = useMemo(() => computeStats(allStatuses), [allStatuses]);

  // ── Actions ──────────────────────────────────────────────

  function recordVaccine(
    statusResult: VaccineStatusResult,
    formValues: RecordVaccineFormValues,
  ) {
    if (!baby) return;

    const now = new Date().toISOString();

    if (statusResult.record) {
      // Update existing record
      vaccineAct.markDone(statusResult.record.id, formValues);
    } else {
      // Create a new record from a definition
      const newRecord: VaccineRecord = {
        id:               genId('vr'),
        babyId:           baby.id,
        vaccineId:        statusResult.definition.id,
        vaccine:          {
          id:                   statusResult.definition.id,
          name:                 statusResult.definition.name,
          shortName:            statusResult.definition.shortName,
          description:          statusResult.definition.description,
          diseases:             [...statusResult.definition.diseases],
          recommendedAgeMonths: statusResult.definition.recommendedAgeMonths,
          recommendedAgeLabel:  statusResult.definition.recommendedAgeLabel,
          numberOfDoses:        statusResult.definition.numberOfDoses,
          isOptional:           statusResult.definition.isOptional,
          isMandatory:          statusResult.definition.isMandatory,
        },
        status:           'done',
        scheduledDate:    statusResult.scheduledDate,
        administeredDate: formValues.administeredDate,
        administeredBy:   formValues.administeredBy,
        location:         formValues.location,
        batchNumber:      formValues.batchNumber,
        sideEffects:      formValues.sideEffects,
        notes:            formValues.notes,
        createdAt:        now,
      };
      vaccineAct.addRecord(newRecord);
    }
  }

  function skipVaccine(statusResult: VaccineStatusResult, reason?: string) {
    if (!baby) return;
    if (statusResult.record) {
      vaccineAct.skipRecord(statusResult.record.id, reason);
    } else {
      const now = new Date().toISOString();
      const rec: VaccineRecord = {
        id:           genId('vr'),
        babyId:       baby.id,
        vaccineId:    statusResult.definition.id,
        vaccine: {
          id:                   statusResult.definition.id,
          name:                 statusResult.definition.name,
          shortName:            statusResult.definition.shortName,
          description:          statusResult.definition.description,
          diseases:             [...statusResult.definition.diseases],
          recommendedAgeMonths: statusResult.definition.recommendedAgeMonths,
          recommendedAgeLabel:  statusResult.definition.recommendedAgeLabel,
          numberOfDoses:        statusResult.definition.numberOfDoses,
          isOptional:           statusResult.definition.isOptional,
          isMandatory:          statusResult.definition.isMandatory,
        },
        status:        'skipped',
        scheduledDate: statusResult.scheduledDate,
        notes:         reason,
        createdAt:     now,
      };
      vaccineAct.addRecord(rec);
    }
  }

  function getStatusById(recordId: string): VaccineStatusResult | undefined {
    return allStatuses.find(s => s.record?.id === recordId);
  }

  function getStatusByVaccineId(vaccineId: string): VaccineStatusResult | undefined {
    return allStatuses.find(s => s.definition.id === vaccineId);
  }

  return {
    // Baby context
    baby,
    // Schedule
    schedule,
    // All computed statuses
    allStatuses,
    sorted,
    groups,
    upcoming,
    history,
    stats,
    // Raw records
    records,
    // Actions
    recordVaccine,
    skipVaccine,
    vaccineActions: vaccineAct,
    // Queries
    getStatusById,
    getStatusByVaccineId,
  };
}
