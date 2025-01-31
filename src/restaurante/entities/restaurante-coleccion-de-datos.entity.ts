import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('RestauranteColeccionDeDatos')
export class RestauranteColeccionDeDatos {
  @PrimaryColumn({ name: 'ID_RestauranteColeccionDeDatos', type: 'int' })
  id: number;

  @Column({ name: 'variableV', type: 'nvarchar', length: 255 })
  variableV: string;

  @Column({ name: 'ID_ColeccionDeDatosRestaurante', type: 'int' })
  coleccionDeDatosRestauranteId: number;

  @Column({ name: 'ID_ColeccionRestaurante', type: 'int' })
  coleccionRestauranteId: number;
}
