import { Module } from '@nestjs/common';
import { DatosEntradaService } from './datos-entrada.service';
import { DatosEntradaController } from './datos-entrada.controller';

@Module({
  controllers: [DatosEntradaController],
  providers: [DatosEntradaService],
  exports: [DatosEntradaService],
})
export class DatosEntradaModule { }
