import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ColeccionCadena')
export class ColeccionCadena {
  @PrimaryColumn('int', { name: 'ID_ColeccionCadena' })
  id: number;

  @Column('nvarchar', { name: 'Descripcion', nullable: false, length: 255 })
  descripcion: string;
}
