import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Owner } from './owner.entity';
import { Vet } from './vet.entity';

export enum UserRole {
    ADMIN = 'Admin',
    OWNER = 'Owner',
    VET = 'Vet',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.OWNER })
    role: UserRole;

    @OneToOne(() => Owner, owner => owner.user)
    ownerProfile: Owner;

    @OneToOne(() => Vet, vet => vet.user)
    vetProfile: Vet;
}
