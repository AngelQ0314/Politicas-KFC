import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Status')
export class Status {
  @PrimaryColumn({ name: 'IDStatus', type: 'int' })
  id: number;

  @Column({ name: 'std_descripcion', type: 'nvarchar', length: 50 })
  descripcion: string;
}
