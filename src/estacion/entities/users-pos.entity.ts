import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Users_Pos')
export class UsersPos {
  @PrimaryColumn({ name: 'IDUsersPos', type: 'int' })
  id: number;

  @Column({ name: 'usr_usuario', type: 'nvarchar', length: 50 })
  usuario: string;
}
