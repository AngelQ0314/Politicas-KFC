import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { RestauranteColeccionDeDatos } from './entities/restaurante-coleccion-de-datos.entity';
import { ColeccionDeDatosRestaurante } from './entities/coleccion-de-datos-restaurante.entity';
import { ColeccionRestaurante } from './entities/coleccion-restaurante.entity';

@Injectable()
export class RestauranteService {
  private filePath = join(__dirname, '..', '..', 'assets', 'politicas_restaurante.json');
  private datosEntradaPath = join(__dirname, '..', '..', 'assets', 'datos_entrada.json');

  constructor(

    @InjectRepository(RestauranteColeccionDeDatos)
    private readonly restauranteRepo: Repository<RestauranteColeccionDeDatos>,

    @InjectRepository(ColeccionDeDatosRestaurante)
    private readonly coleccionDatosRepo: Repository<ColeccionDeDatosRestaurante>,

    @InjectRepository(ColeccionRestaurante)
    private readonly coleccionRestauranteRepo: Repository<ColeccionRestaurante>,
  ) { }


  // Leer JSON de políticas
  private leerArchivoDePoliticas(): any[] {
    if (!existsSync(this.filePath)) return [];
    try {
      const fileContent = readFileSync(this.filePath, 'utf8');
      return JSON.parse(fileContent) || [];
    } catch (error) {
      console.error('Error al leer el JSON:', error.message);
      return [];
    }
  }


  //Escribir JSON de políticas
  private escribirArchivoDePoliticas(politicas: any[]) {
    try {
      writeFileSync(this.filePath, JSON.stringify(politicas, null, 2), 'utf8');
      console.log('Archivo JSON actualizado correctamente.');
    } catch (error) {
      console.error('Error al escribir el JSON:', error.message);
    }
  }


  //Leer JSON de datos de entrada
  private leerDatosEntrada(): any {
    if (!existsSync(this.datosEntradaPath)) return null;
    try {
      return JSON.parse(readFileSync(this.datosEntradaPath, 'utf8')) || null;
    } catch (error) {
      console.error('Error al leer el JSON de datos de entrada:', error.message);
      return null;
    }
  }


  //Obtener todas las políticas
  obtenerTodasLasPoliticas() {
    return this.leerArchivoDePoliticas();
  }


  //Insertar una o varias políticas
  async insertarPolitica(politicas: any | any[]) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    if (!Array.isArray(politicas)) {
      politicas = [politicas];
    }

    //Obtener el último registro de datos de entrada
    const datosEntrada = this.leerDatosEntrada();
    if (!datosEntrada) {
      throw new NotFoundException('No hay datos de entrada registrados.');
    }

    //Encontrar el ID más alto actual
    let maxId = listaPoliticas.length > 0 ? Math.max(...listaPoliticas.map(p => p.id)) : 0;

    const nuevasPoliticas = politicas.map(politica => ({
      id: ++maxId,
      ...politica,
      //Si la política es "SERVIDOR", entonces se llena automáticamente con ip_servidor:puerto_pos
      Valor_Desarrollo: politica.Parametro_Restaurante === 'SERVIDOR'
        ? `${datosEntrada.ip_servidor}:${datosEntrada.puerto_pos}`
        : politica.Valor_Desarrollo
    }));

    listaPoliticas = [...listaPoliticas, ...nuevasPoliticas];

    this.escribirArchivoDePoliticas(listaPoliticas);
    return { mensaje: 'Políticas agregadas correctamente', data: nuevasPoliticas };
  }


  //Editar una política
  async editarPolitica(id: number, politicaActualizada: { Coleccion_Restaurante: string; Parametro_Restaurante: string; Valor_Desarrollo: string }) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    const index = listaPoliticas.findIndex(p => p.id === id);

    if (index === -1) {
      throw new NotFoundException(`No se encontró la política con ID ${id}`);
    }

    //Obtener datos de entrada para actualizar si es SERVIDOR
    const datosEntrada = this.leerDatosEntrada()

    listaPoliticas[index] = {
      id,
      ...politicaActualizada,
      Valor_Desarrollo: politicaActualizada.Parametro_Restaurante === 'SERVIDOR'
        ? `${datosEntrada.ip_servidor}:${datosEntrada.puerto_pos}`
        : politicaActualizada.Valor_Desarrollo
    };

    this.escribirArchivoDePoliticas(listaPoliticas);
    return { mensaje: 'Política actualizada correctamente', data: listaPoliticas[index] };
  }


  //Eliminar una política
  eliminarPolitica(id: number) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    const nuevaLista = listaPoliticas.filter(p => p.id !== id);

    if (nuevaLista.length === listaPoliticas.length) {
      throw new NotFoundException(`No se encontró la política con ID ${id}`);
    }

    this.escribirArchivoDePoliticas(nuevaLista);
    return { mensaje: `Política con ID ${id} eliminada correctamente.` };
  }


  // Validar políticas contra la base de datos
  async validarPoliticasRestaurante() {
    //Obtener el último registro de datos de entrada
    const datosEntrada = this.leerDatosEntrada();
    if (!datosEntrada) {
      throw new NotFoundException('No hay datos de entrada registrados.');
    }

    let politicasDesarrollo = this.leerArchivoDePoliticas();

    //Reemplazar dinámicamente "SERVIDOR" con IP y PUERTO
    politicasDesarrollo = politicasDesarrollo.map(politica => ({
      ...politica,
      Valor_Desarrollo: politica.Parametro_Restaurante === 'SERVIDOR'
        ? `${datosEntrada.ip_servidor}:${datosEntrada.puerto_pos}`
        : politica.Valor_Desarrollo
    }));

    const resultados = [];

    for (const politica of politicasDesarrollo) {
      const resultado = await this.restauranteRepo
        .createQueryBuilder('rcd')
        .select([
          'cr.descripcion AS Coleccion_Restaurante',
          'cdr.descripcion AS Parametro_Restaurante',
          'rcd.variableV AS Varchar_Valor_Restaurante_BD',
          ':Valor_Desarrollo AS Varchar_Valor_Restaurante_Desarrollo',
          `CASE 
              WHEN rcd.variableV = :Valor_Desarrollo THEN 'coinciden'
              ELSE '--> NO COINCIDEN <--'
           END AS Varchar_Validacion_Coincidencia`,
        ])
        .innerJoin(ColeccionDeDatosRestaurante, 'cdr', 'cdr.ID_ColeccionDeDatosRestaurante = rcd.ID_ColeccionDeDatosRestaurante')
        .innerJoin(ColeccionRestaurante, 'cr', 'cr.ID_ColeccionRestaurante = rcd.ID_ColeccionRestaurante')
        .where('cr.descripcion = :Coleccion_Restaurante', { Coleccion_Restaurante: politica.Coleccion_Restaurante })
        .andWhere('cdr.descripcion = :Parametro_Restaurante', { Parametro_Restaurante: politica.Parametro_Restaurante })
        .setParameters({ Valor_Desarrollo: politica.Valor_Desarrollo })
        .getRawOne();

      resultados.push(resultado || {
        Coleccion_Restaurante: politica.Coleccion_Restaurante,
        Parametro_Restaurante: politica.Parametro_Restaurante,
        Varchar_Valor_Restaurante_BD: 'Sin datos',
        Varchar_Valor_Restaurante_Desarrollo: politica.Valor_Desarrollo,
        Varchar_Validacion_Coincidencia: '--> NO COINCIDEN <--',
      });
    }

    const totalNoCoincidencias = resultados.filter(
      (r) => r.Varchar_Validacion_Coincidencia === '--> NO COINCIDEN <--',
    ).length;

    const mensaje = totalNoCoincidencias > 0
      ? `EXISTEN ${totalNoCoincidencias} VALOR(ES) QUE NO COINCIDE(N). REVISE EL DETALLE.`
      : 'Todas las políticas de Cadena coinciden con el ambiente de Desarrollo.';


    return { mensaje, resultados };
  }


  //Actualizar en la base de datos
  async actualizarValorEnBaseDeDatos(
    coleccionRestaurante: string,
    parametroRestaurante: string,
    nuevoValor: string
  ) {
    console.log('Buscando política en la base de datos...');
    console.log({ coleccionRestaurante, parametroRestaurante, nuevoValor });

    // Buscar la política en la base de datos
    const politica = await this.restauranteRepo
      .createQueryBuilder('rcd')
      .select([
        'rcd.ID_ColeccionDeDatosRestaurante',
        'rcd.variableV',
      ])
      .innerJoin(ColeccionDeDatosRestaurante, 'cdr', 'cdr.ID_ColeccionDeDatosRestaurante = rcd.ID_ColeccionDeDatosRestaurante')
      .innerJoin(ColeccionRestaurante, 'cr', 'cr.ID_ColeccionRestaurante = rcd.ID_ColeccionRestaurante')
      .where('cr.Descripcion = :coleccionRestaurante', { coleccionRestaurante })
      .andWhere('cdr.Descripcion = :parametroRestaurante', { parametroRestaurante })
      .getRawOne();

    console.log('🔎 Resultado de búsqueda:', politica);

    if (!politica) {
      throw new NotFoundException(
        `No se encontró la política con Colección: ${coleccionRestaurante} y Parámetro: ${parametroRestaurante}`
      );
    }

    console.log('Editando el valor de variableV...');

    // Actualizar el valor en la base de datos
    await this.restauranteRepo
      .createQueryBuilder()
      .update(RestauranteColeccionDeDatos)
      .set({ variableV: nuevoValor })
      .where('ID_ColeccionDeDatosRestaurante = :id', { id: politica.ID_ColeccionDeDatosRestaurante })
      .execute();

    console.log('Valor actualizado correctamente.');

    return {
      mensaje: 'Valor actualizado correctamente en la base de datos. Ahora coinciden.',
      coleccionRestaurante,
      parametroRestaurante,
      nuevoValor,
    };
  }

}
