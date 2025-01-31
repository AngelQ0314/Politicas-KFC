import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosEntradaModule } from './datos-entrada/datos-entrada.module';
import { CadenaModule } from './cadena/cadena.module';
import { RestauranteModule } from './restaurante/restaurante.module';
import { EstacionModule } from './estacion/estacion.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: '127.0.0.1',
      port: 1433,
      username: 'angel_0314', 
      password: '0314',
      database: 'MAXPOINT_K015_17072024_4.0.9.4_DOMICILIO',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, 
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    DatosEntradaModule,
    CadenaModule,
    RestauranteModule,
    EstacionModule,
  ],
  controllers:[AppController],
  providers:[AppService],
})
export class AppModule {}
