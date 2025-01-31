import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Estacion')
export class Estacion {
  @PrimaryColumn({ name: 'IDEstacion', type: 'int' })
  id: number;

  @Column({ name: 'est_nombre', type: 'nvarchar', length: 50 })
  nombre: string;
}
