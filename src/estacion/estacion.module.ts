import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstacionColeccionDeDatos } from './entities/estacion-coleccion-de-datos.entity';
import { ColeccionDeDatosEstacion } from './entities/coleccion-de-datos-estacion.entity';
import { ColeccionEstacion } from './entities/coleccion-estacion.entity';
import { Estacion } from './entities/estacion.entity';
import { ControlEstacion } from './entities/control-estacion.entity';
import { UsersPos } from './entities/users-pos.entity';
import { Status } from './entities/status.entity';
import { EstacionService } from './estacion.service';
import { EstacionController } from './estacion.controller';
import { DatosEntradaModule } from 'src/datos-entrada/datos-entrada.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstacionColeccionDeDatos,
      ColeccionDeDatosEstacion,
      ColeccionEstacion,
      Estacion,
      ControlEstacion,
      UsersPos,
      Status,
    ]),
    DatosEntradaModule,
  ],
  controllers: [EstacionController],
  providers: [EstacionService],
})
export class EstacionModule { }
