// genetic-analyzer.service.ts
import { Injectable } from '@nestjs/common';
import { GeneticTraitDto, GeneticSummaryDto } from './dto/genetic-summary.dto';
import { Pet } from './pet.entity';

@Injectable()
export class GeneticAnalyzerService {
  private readonly knownRiskFactors: Record<string, { 
    riskLevel: 'low' | 'moderate' | 'high',
    description: string
  }> = {
    'MDR1': { 
      riskLevel: 'high',
      description: 'Sensitivity to certain medications including ivermectin'
    },
    'vWD': { 
      riskLevel: 'high', 
      description: 'von Willebrand Disease - bleeding disorder'
    },
    'DM': { 
      riskLevel: 'moderate', 
      description: 'Degenerative Myelopathy - progressive spinal cord disease'
    },
    'EIC': { 
      riskLevel: 'moderate', 
      description: 'Exercise Induced Collapse'
    },
    'PRA': { 
      riskLevel: 'moderate', 
      description: 'Progressive Retinal Atrophy - vision loss'
    },
    'CDDY': { 
      riskLevel: 'moderate', 
      description: 'Chondrodystrophy - associated with IVDD risk'
    },
    'CDPA': { 
      riskLevel: 'low', 
      description: 'Chondrodysplasia - short-legged phenotype'
    }
  };

  validateGeneticData(data: any): boolean {
    // Basic validation to ensure data is in expected format
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Add more specific validation logic as needed
    return true;
  }

  analyzeGeneticData(pet: Pet): GeneticSummaryDto {
    if (!pet.geneticData) {
      throw new Error('No genetic data available for analysis');
    }

    const traits: GeneticTraitDto[] = [];
    const knownConditions: string[] = [];
    let highRiskCount = 0;
    let moderateRiskCount = 0;

    // Process genetic markers
    if (pet.geneticData.markers) {
      Object.entries(pet.geneticData.markers).forEach(([marker, value]) => {
        const trait: GeneticTraitDto = {
          trait: marker,
          value: value as string | number | boolean
        };

        // Check if this is a known risk factor
        if (marker in this.knownRiskFactors) {
          const risk = this.knownRiskFactors[marker];
          trait.riskLevel = risk.riskLevel;
          trait.description = risk.description;
          knownConditions.push(marker);

          if (risk.riskLevel === 'high') {
            highRiskCount++;
          } else if (risk.riskLevel === 'moderate') {
            moderateRiskCount++;
          }
        }

        traits.push(trait);
      });
    }

    // Process breed traits if available
    if (pet.geneticData.traits) {
      Object.entries(pet.geneticData.traits).forEach(([trait, value]) => {
        traits.push({
          trait,
          value: value as string | number | boolean
        });
      });
    }

    return {
      petId: pet.id,
      petName: pet.name,
      identifiedTraits: traits,
      riskAssessment: {
        highRiskCount,
        moderateRiskCount,
        knownConditions
      }
    };
  }
}
