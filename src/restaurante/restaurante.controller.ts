import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { RestauranteService } from './restaurante.service';

@Controller('restaurante')
export class RestauranteController {
  constructor(private readonly restauranteService: RestauranteService) { }


  // Obtener todas las políticas de Restaurante
  @Get('politicas')
  obtenerTodasLasPoliticas() {
    return this.restauranteService.obtenerTodasLasPoliticas();
  }


  //Insertar una nueva política
  @Post('politicas')
  insertarPolitica(@Body() politicas: any) {
    return this.restauranteService.insertarPolitica(politicas);
  }


  //Editar una política por ID
  @Put('politicas/:id')
  editarPolitica(@Param('id') id: number, @Body() politicaActualizada: any) {
    return this.restauranteService.editarPolitica(Number(id), politicaActualizada);
  }


  //Eliminar una política por ID
  @Delete('politicas/:id')
  eliminarPolitica(@Param('id') id: number) {
    return this.restauranteService.eliminarPolitica(Number(id));
  }


  //Validar políticas contra la base de datos
  @Get('politicas/validar')
  async validarPoliticasRestaurante() {
    return this.restauranteService.validarPoliticasRestaurante();
  }


  //Actualizar el valor en la base de datos
  @Put('politicas/corregir/:coleccionRestaurante/:parametroRestaurante')
  async corregirPolitica(
    @Param('coleccionRestaurante') coleccionRestaurante: string,
    @Param('parametroRestaurante') parametroRestaurante: string,
    @Body('nuevoValor') nuevoValor: string
  ) {
    return this.restauranteService.actualizarValorEnBaseDeDatos(
      coleccionRestaurante,
      parametroRestaurante,
      nuevoValor
    );
  }

}
