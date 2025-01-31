import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ColeccionDeDatosRestaurante')
export class ColeccionDeDatosRestaurante {
  @PrimaryColumn({ name: 'ID_ColeccionDeDatosRestaurante', type: 'int' })
  id: number;

  @Column({ name: 'Descripcion', type: 'nvarchar', length: 255 })
  descripcion: string;
}
