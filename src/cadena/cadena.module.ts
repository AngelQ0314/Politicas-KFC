// cadena.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CadenaController } from './cadena.controller';
import { CadenaService } from './cadena.service';
import { CadenaColeccionDeDatos } from './entities/cadena-coleccion-de-datos.entity';
import { ColeccionDeDatosCadena } from './entities/coleccion-de-datos-cadena.entity';
import { ColeccionCadena } from './entities/coleccion-cadena.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CadenaColeccionDeDatos,
      ColeccionDeDatosCadena,
      ColeccionCadena,
    ]),
  ],
  controllers: [CadenaController],
  providers: [CadenaService],
})
export class CadenaModule { }
