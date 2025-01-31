import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Control_Estacion')
export class ControlEstacion {
  @PrimaryColumn({ name: 'IDEstacion', type: 'int' })
  estacionId: number;

  @Column({ name: 'IDUsersPos', type: 'int' })
  usersPosId: number;

  @Column({ name: 'IDStatus', type: 'int' })
  statusId: number;
}
