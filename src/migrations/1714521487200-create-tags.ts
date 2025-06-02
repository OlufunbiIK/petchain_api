// ----- MIGRATION FOR TAGS -----
// src/migrations/1714521487200-create-tags.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTags1714521487200 implements MigrationInterface {
  name = 'CreateTags1714521487200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tags table
    await queryRunner.query(`
      CREATE TYPE "tag_type_enum" AS ENUM ('treatment', 'vaccine');
    `);
    
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "type" "tag_type_enum" NOT NULL DEFAULT 'treatment',
        CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id")
      )
    `);

    // Create junction tables
    await queryRunner.query(`
      CREATE TABLE "treatment_tags" (
        "treatment_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_treatment_tags" PRIMARY KEY ("treatment_id", "tag_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vaccination_tags" (
        "vaccination_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_vaccination_tags" PRIMARY KEY ("vaccination_id", "tag_id")
      )
    `);

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "treatment_tags" 
      ADD CONSTRAINT "FK_treatment_tags_treatment" 
      FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "treatment_tags" 
      ADD CONSTRAINT "FK_treatment_tags_tag" 
      FOREIGN KEY ("tag_id") REFERENCES "tags"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "vaccination_tags" 
      ADD CONSTRAINT "FK_vaccination_tags_vaccination" 
      FOREIGN KEY ("vaccination_id") REFERENCES "vaccinations"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "vaccination_tags" 
      ADD CONSTRAINT "FK_vaccination_tags_tag" 
      FOREIGN KEY ("tag_id") REFERENCES "tags"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create initial tags
    await queryRunner.query(`
      INSERT INTO "tags" (name, type) VALUES
      ('Emergency', 'treatment'),
      ('Routine', 'treatment'),
      ('Surgery', 'treatment'),
      ('Annual', 'vaccine'),
      ('Optional', 'vaccine')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "vaccination_tags" DROP CONSTRAINT "FK_vaccination_tags_tag"`);
    await queryRunner.query(`ALTER TABLE "vaccination_tags" DROP CONSTRAINT "FK_vaccination_tags_vaccination"`);
    await queryRunner.query(`ALTER TABLE "treatment_tags" DROP CONSTRAINT "FK_treatment_tags_tag"`);
    await queryRunner.query(`ALTER TABLE "treatment_tags" DROP CONSTRAINT "FK_treatment_tags_treatment"`);
    
    // Drop junction tables
    await queryRunner.query(`DROP TABLE "vaccination_tags"`);
    await queryRunner.query(`DROP TABLE "treatment_tags"`);
    
    // Drop tags table
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TYPE "tag_type_enum"`);
  }
}