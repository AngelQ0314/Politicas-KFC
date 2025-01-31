import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EstacionService } from './estacion.service';

@Controller('estacion')
export class EstacionController {
  constructor(private readonly estacionService: EstacionService) { }


  //Validar políticas contra la base de datos
  @Get('politicas/validar')
  async validarPoliticasEstacion() {
    return this.estacionService.validarPoliticasEstacion();
  }


  //Obtener todas las políticas de estación
  @Get('politicas')
  obtenerTodasLasPoliticas() {
    return this.estacionService.obtenerTodasLasPoliticas();
  }


  //Insertar una nueva política
  @Post('politicas')
  insertarPolitica(@Body() politicas: any) {
    return this.estacionService.insertarPolitica(politicas);
  }

  //Editar una política por ID
  @Put('politicas/:id')
  editarPolitica(@Param('id') id: number, @Body() politicaActualizada: any) {
    return this.estacionService.editarPolitica(id, politicaActualizada);
  }

  
  //Eliminar una política por ID
  @Delete('politicas/:id')
  eliminarPolitica(@Param('id') id: number) {
    return this.estacionService.eliminarPolitica(id);
  }

  //Actualizar el valor en la base de datos
  @Put('politicas/corregir/:estacion/:coleccion/:parametro')
  async corregirPolitica(
    @Param('estacion') estacion: string,
    @Param('coleccion') coleccion: string,
    @Param('parametro') parametro: string,
    @Body('nuevoValor') nuevoValor:string
  ){
    return this.estacionService.actualizarValorEstacion(estacion,coleccion,parametro,nuevoValor)
  }
}
