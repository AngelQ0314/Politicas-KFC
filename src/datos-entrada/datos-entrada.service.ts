import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DatosEntradaService {
  private filePath = join(__dirname, '..', '..', 'assets', 'datos_entrada.json');

  constructor() {
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify({}, null, 2), 'utf8');
    }
  }

  
  //Leer datos del archivo JSON
  private leerArchivo(): any {
    try {
      const fileContent = readFileSync(this.filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error al leer el JSON:', error.message);
      return {};
    }
  }


  //Escribir datos en el archivo JSON
  private escribirArchivo(datos: any): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(datos, null, 2), 'utf8');
      console.log('Archivo JSON actualizado correctamente.');
    } catch (error) {
      console.error('Error al escribir el JSON:', error.message);
    }
  }


  //Obtener datos de entrada si aún no han expirado
  obtenerDatosEntrada(): any {
    const datos = this.leerArchivo();
    if (Object.keys(datos).length === 0) {
      throw new NotFoundException('No hay datos disponibles.');
    }
    return datos;
  }


  //Insertar o actualizar datos de entrada con expiración de 5 minuto
  insertarDatos(datos: any): any {
    const tiempoExpiracion = Date.now() + 5 *  60 * 1000;
    this.escribirArchivo(datos);
    console.log(`Datos guardados correctamente. Expirarán en 5 minuto.`);
    setTimeout(() => {
      this.eliminarDatosSiHanExpirado(tiempoExpiracion);
    }, 5* 60 * 1000);

    return { mensaje: 'Datos de entrada guardados correctamente.', datos };
  }


  //Editar un campo específico dentro del JSON sin afectar el formato
  editarDato(clave: string, valor: string): any {
    const datos = this.leerArchivo();
    if (!(clave in datos)) {
      throw new NotFoundException(`La clave "${clave}" no existe.`);
    }

    datos[clave] = valor;
    this.escribirArchivo(datos);

    console.log(`Clave "${clave}" editada correctamente.`);
    return { mensaje: `Clave "${clave}" editada correctamente.`, datos };
  }


  //Eliminar una clave específica
  eliminarDato(clave: string): any {
    const datos = this.leerArchivo();
    if (!(clave in datos)) {
      throw new NotFoundException(`La clave "${clave}" no existe.`);
    }

    delete datos[clave];
    this.escribirArchivo(datos);

    console.log(`Clave "${clave}" eliminada correctamente.`);
    return { mensaje: `Clave "${clave}" eliminada correctamente.` };
  }

  //Eliminar datos automáticamente después de 5 minuto
  private eliminarDatosSiHanExpirado(expiracion: number) {
    const tiempoActual = Date.now();
    if (tiempoActual >= expiracion) {
      this.escribirArchivo({});
      console.log('Todos los datos han expirado y fueron eliminados automáticamente.');
    }
  }

  //Verificar cada 60 segundos si los datos han expirado
  @Cron('*/60 * * * * *') 
  verificarEliminacionAutomatica() {
    const datos = this.leerArchivo();
    if (Object.keys(datos).length > 0) {
      console.log('Datos aún válidos, esperando expiración...');
    } else {
      console.log('No hay datos para eliminar.');
    }
  }
}
