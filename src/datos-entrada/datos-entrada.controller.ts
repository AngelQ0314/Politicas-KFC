import { Controller, Get, Post, Delete, Body, Param, Put, NotFoundException } from '@nestjs/common';
import { DatosEntradaService } from './datos-entrada.service';

@Controller('datos-entrada')
export class DatosEntradaController {
  constructor(private readonly datosEntradaService: DatosEntradaService) { }

  //Obtener los datos de entrada desde el JSON
  @Get()
  obtenerDatosEntrada() {
    return this.datosEntradaService.obtenerDatosEntrada();
  }


  //Insertar datos de entrada
  @Post()
  insertarDatos(@Body() datos: any) {
    return this.datosEntradaService.insertarDatos(datos);
  }


  // Editar una clave específica
  @Put('')
  editarDato(@Body() body: { clave: string; valor: string }) {
    if (!body.clave || !body.valor) {
      throw new NotFoundException('Debes proporcionar una clave y un valor.');
    }
    return this.datosEntradaService.editarDato(body.clave, body.valor);
  }


  //Eliminar un dato específico
  @Delete(':clave')
  eliminarDato(@Param('clave') clave: string) {
    return this.datosEntradaService.eliminarDato(clave);
  }
}
