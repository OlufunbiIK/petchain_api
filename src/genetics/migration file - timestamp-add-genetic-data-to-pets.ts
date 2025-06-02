// migration file - timestamp-add-genetic-data-to-pets.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGeneticDataToPets1714830940133 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'pet',
      new TableColumn({
        name: 'geneticData',
        type: 'json',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('pet', 'geneticData');
  }
}