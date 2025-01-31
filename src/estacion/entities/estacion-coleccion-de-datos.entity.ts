import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('EstacionColeccionDeDatos')
export class EstacionColeccionDeDatos {
  @PrimaryColumn({ name: 'ID_EstacionColeccionDeDatos', type: 'int' })
  id: number;

  @Column({ name: 'variableV', type: 'nvarchar', length: 255 })
  variableV: string;

  @Column({ name: 'ID_ColeccionDeDatosEstacion', type: 'int' })
  coleccionDeDatosEstacionId: number;

  @Column({ name: 'ID_ColeccionEstacion', type: 'int' })
  coleccionEstacionId: number;

  @Column({ name: 'IDEstacion', type: 'int' })
  estacionId: number;
}
