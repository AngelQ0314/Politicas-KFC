import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ColeccionDeDatosCadena') 
export class ColeccionDeDatosCadena {
  @PrimaryColumn('int', { name: 'ID_ColeccionDeDatosCadena' })
  id: number;

  @Column('nvarchar', { name: 'Descripcion', nullable: false, length: 255 })
  descripcion: string;
}
