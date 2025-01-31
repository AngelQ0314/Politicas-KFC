import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { PoliticaCadenaDto } from './dto/cadena.dto';
import { CadenaService } from './cadena.service';

@Controller('cadena')
export class CadenaController {
  constructor(private readonly cadenaService: CadenaService) { }

  //Obtener todas las políticas
  @Get('politicas')
  obtenerTodasLasPoliticas() {
    return this.cadenaService.obtenerTodasLasPoliticas();
  }

  //Insertar una nueva política
  @Post('politicas')
  insertarPolitica(@Body() politica: { Coleccion_Cadena: string; Parametro_Cadena: string; Valor_Desarrollo: string }) {
    return this.cadenaService.insertarPolitica(politica);
  }

  // Editar una política por ID
  @Put('politicas/:id')
  editarPolitica(@Param('id') id: number, @Body() politica: any) {
    return this.cadenaService.editarPolitica(Number(id), politica);
  }
  // Eliminar una política por ID
  @Delete('politicas/:id')
  eliminarPolitica(@Param('id') id: number) {
    return this.cadenaService.eliminarPolitica(Number(id));
  }

  // Validar las políticas contra la base de datos
  @Get('politicas/validar')
  async validarPoliticasCadena() {
    return await this.cadenaService.validarPoliticasCadena();
  }

  //Actualizar el valor en la base de datos
  @Put('politicas/corregir/:Coleccion_Cadena/:Parametro_Cadena')
  async corregirPolitica(
    @Param('Coleccion_Cadena') Coleccion_Cadena: string,
    @Param('Parametro_Cadena') Parametro_Cadena: string,
    @Body('Nuevo_Valor') Nuevo_Valor: string
  ) {
    console.log('[CONTROLLER] Recibida solicitud de actualización:', { Coleccion_Cadena, Parametro_Cadena, Nuevo_Valor });
    return this.cadenaService.actualizarValorEnBaseDeDatos(Coleccion_Cadena, Parametro_Cadena, Nuevo_Valor);
  }

}
