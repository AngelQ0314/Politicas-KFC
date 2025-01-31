import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ColeccionDeDatosCadena } from './coleccion-de-datos-cadena.entity';
import { ColeccionCadena } from './coleccion-cadena.entity';

@Entity('CadenaColeccionDeDatos')
export class CadenaColeccionDeDatos {
  @PrimaryColumn('int', { name: 'ID_ColeccionDeDatosCadena' })
  coleccionDeDatosCadenaId: number;
  @PrimaryColumn('int', { name: 'ID_ColeccionCadena' })
  coleccionCadenaId: number;

  @ManyToOne(() => ColeccionDeDatosCadena, (cdc) => cdc.id, { nullable: false })
  @JoinColumn({ name: 'ID_ColeccionDeDatosCadena' })
  coleccionDeDatosCadena: ColeccionDeDatosCadena;

  @ManyToOne(() => ColeccionCadena, (cc) => cc.id, { nullable: false })
  @JoinColumn({ name: 'ID_ColeccionCadena' })
  coleccionCadena: ColeccionCadena;

  @Column('nvarchar', { name: 'variableV', nullable: true, length: 255 })
  variableV: string;
}
