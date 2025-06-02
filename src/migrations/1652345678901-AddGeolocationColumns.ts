import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeolocationColumns1652345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise {
    // Add latitude and longitude columns to vet table
    await queryRunner.query(`
      ALTER TABLE vet 
      ADD COLUMN latitude DECIMAL(10, 7),
      ADD COLUMN longitude DECIMAL(10, 7)
    `);

    // Add latitude and longitude columns to owner table
    await queryRunner.query(`
      ALTER TABLE owner 
      ADD COLUMN latitude DECIMAL(10, 7),
      ADD COLUMN longitude DECIMAL(10, 7)
    `);

    // Add indexes for geospatial queries
    await queryRunner.query(`
      CREATE INDEX idx_vet_location ON vet(latitude, longitude);
      CREATE INDEX idx_owner_location ON owner(latitude, longitude);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise {
    // Remove indexes
    await queryRunner.query(`
      DROP INDEX idx_vet_location;
      DROP INDEX idx_owner_location;
    `);

    // Remove columns from vet table
    await queryRunner.query(`
      ALTER TABLE vet 
      DROP COLUMN latitude,
      DROP COLUMN longitude
    `);

    // Remove columns from owner table
    await queryRunner.query(`
      ALTER TABLE owner 
      DROP COLUMN latitude,
      DROP COLUMN longitude
    `);
  }
}