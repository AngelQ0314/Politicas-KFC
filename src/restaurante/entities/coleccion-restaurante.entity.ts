import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ColeccionRestaurante')
export class ColeccionRestaurante {
  @PrimaryColumn({ name: 'ID_ColeccionRestaurante', type: 'int' })
  id: number;

  @Column({ name: 'Descripcion', type: 'nvarchar', length: 255 })
  descripcion: string;
}
