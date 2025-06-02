export class TreatmentSummaryDto {
  id: number;
  date: Date;
  description: string;
  veterinarian: string;
  notes?: string;
}

export class VaccinationSummaryDto {
  id: number;
  name: string;
  date: Date;
  expirationDate: Date;
  veterinarian: string;
  notes?: string;
  isUpcoming: boolean;
}

export class AppointmentSummaryDto {
  id: number;
  date: Date;
  purpose: string;
  veterinarianName: string;
  clinicName: string;
  status: string;
  notes?: string;
}

export class PetMedicalSummaryDto {
  id: number;
  name: string;
  species: string;
  breed: string;
  birthDate: Date;
  gender: string;
  microchipId?: string;
  ownerName: string;
  treatments: TreatmentSummaryDto[];
  vaccinations: VaccinationSummaryDto[];
  latestAppointment?: AppointmentSummaryDto;
  upcomingVaccinations: VaccinationSummaryDto[];
  blockchainVerified: boolean;
  lastUpdated: Date;
}
