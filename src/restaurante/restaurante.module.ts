import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteColeccionDeDatos } from './entities/restaurante-coleccion-de-datos.entity';
import { ColeccionDeDatosRestaurante } from './entities/coleccion-de-datos-restaurante.entity';
import { ColeccionRestaurante } from './entities/coleccion-restaurante.entity';
import { RestauranteService } from './restaurante.service';
import { RestauranteController } from './restaurante.controller';
import { DatosEntradaModule } from 'src/datos-entrada/datos-entrada.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RestauranteColeccionDeDatos,
      ColeccionDeDatosRestaurante,
      ColeccionRestaurante,
    ]),
    DatosEntradaModule,
  ],
  controllers: [RestauranteController],
  providers: [RestauranteService],
})
export class RestauranteModule {}
