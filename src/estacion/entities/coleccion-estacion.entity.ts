import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ColeccionEstacion')
export class ColeccionEstacion {
  @PrimaryColumn({ name: 'ID_ColeccionEstacion', type: 'int' })
  id: number;

  @Column({ name: 'Descripcion', type: 'nvarchar', length: 255 })
  descripcion: string;
}
