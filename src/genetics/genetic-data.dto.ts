// genetic-data.dto.ts
export class GeneticDataDto {
    geneticData: Record<string, any>;
  }
  
  // genetic-summary.dto.ts
  export class GeneticTraitDto {
    trait: string;
    value: string | number | boolean;
    riskLevel?: 'low' | 'moderate' | 'high';
    description?: string;
  }
  
  export class GeneticSummaryDto {
    petId: number;
    petName: string;
    identifiedTraits: GeneticTraitDto[];
    riskAssessment: {
      highRiskCount: number;
      moderateRiskCount: number;
      knownConditions: string[];
    };
  }
  