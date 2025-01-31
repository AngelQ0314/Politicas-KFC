import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ColeccionDeDatosEstacion')
export class ColeccionDeDatosEstacion {
  @PrimaryColumn({ name: 'ID_ColeccionDeDatosEstacion', type: 'int' })
  id: number;

  @Column({ name: 'Descripcion', type: 'nvarchar', length: 255 })
  descripcion: string;
}
