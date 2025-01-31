import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { EstacionColeccionDeDatos } from './entities/estacion-coleccion-de-datos.entity';
import { ColeccionDeDatosEstacion } from './entities/coleccion-de-datos-estacion.entity';
import { ColeccionEstacion } from './entities/coleccion-estacion.entity';
import { Estacion } from './entities/estacion.entity';
import { ControlEstacion } from './entities/control-estacion.entity';
import { UsersPos } from './entities/users-pos.entity';
import { Status } from './entities/status.entity';

@Injectable()
export class EstacionService {
  private filePath = join(__dirname, '..', '..', 'assets', 'politicas_estacion.json');
  private datosEntradaPath = join(__dirname, '..', '..', 'assets', 'datos_entrada.json');

  constructor(
    @InjectRepository(EstacionColeccionDeDatos)
    private readonly estacionRepo: Repository<EstacionColeccionDeDatos>,

    @InjectRepository(ColeccionDeDatosEstacion)
    private readonly coleccionDatosRepo: Repository<ColeccionDeDatosEstacion>,

    @InjectRepository(ColeccionEstacion)
    private readonly coleccionEstacionRepo: Repository<ColeccionEstacion>,

    @InjectRepository(Estacion)
    private readonly estacionRepository: Repository<Estacion>,

    @InjectRepository(ControlEstacion)
    private readonly controlEstacionRepo: Repository<ControlEstacion>,

    @InjectRepository(UsersPos)
    private readonly usersPosRepo: Repository<UsersPos>,

    @InjectRepository(Status)
    private readonly statusRepo: Repository<Status>,
  ) { }


  //Leer JSON de políticas
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


  //Leer archivo JSON de datos de entrada
  private leerDatosEntrada(): any {
    if (!existsSync(this.datosEntradaPath)) return null;
    try {
      const fileContent = readFileSync(this.datosEntradaPath, 'utf8');
      return JSON.parse(fileContent) || null;
    } catch (error) {
      console.error('Error al leer el JSON de datos de entrada:', error.message);
      return null;
    }
  }


  //Guardar datos en `datos_entrada.json`
  private guardarDatosEntrada(datos: any) {
    try {
      writeFileSync(this.datosEntradaPath, JSON.stringify(datos, null, 2), 'utf8');
      console.log('Datos de entrada actualizados en JSON.');
    } catch (error) {
      console.error('Error al guardar los datos de entrada:', error.message);
    }
  }


  //Obtener todas las políticas
  obtenerTodasLasPoliticas() {
    return this.leerArchivoDePoliticas();
  }


  // Insertar una o varias políticas
  async insertarPolitica(politicas: any | any[]) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    if (!Array.isArray(politicas)) {
      politicas = [politicas];
    }

    //Encontrar el ID más alto actual
    let maxId = listaPoliticas.length > 0 ? Math.max(...listaPoliticas.map(p => p.id)) : 0;

    //Obtener el último registro de datos de entrada
    const datosEntrada = this.leerDatosEntrada();
    if (!datosEntrada) {
      throw new NotFoundException('No hay datos de entrada registrados en el JSON.');
    }

    //Procesar las políticas
    const nuevasPoliticas = politicas.map(politica => ({
      id: ++maxId,
      ...politica,
      Valor_Desarrollo: politica.Parametro_Estacion === 'URL_SERVICIO'
        ? `http://${datosEntrada[`ip_${politica.Estacion.toLowerCase()}`]}:${datosEntrada.puerto_impres_net}`
        : politica.Valor_Desarrollo,
    }));

    listaPoliticas = [...listaPoliticas, ...nuevasPoliticas];

    this.escribirArchivoDePoliticas(listaPoliticas);
    return { mensaje: 'Políticas agregadas correctamente', data: nuevasPoliticas };
  }


  //Editar una política
  editarPolitica(id: number, politicaActualizada: { Estacion: string; Coleccion_Estacion: string; Parametro_Estacion: string; Valor_Desarrollo: string }) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    const idNumero = Number(id);
    const index = listaPoliticas.findIndex(p => p.id === idNumero);

    if (index === -1) {
      throw new NotFoundException(`No se encontró la política con ID ${idNumero}`);
    }

    listaPoliticas[index] = { id: idNumero, ...politicaActualizada };

    this.escribirArchivoDePoliticas(listaPoliticas);
    return { mensaje: 'Política actualizada correctamente', data: listaPoliticas[index] };
  }


  //Eliminar una política
  eliminarPolitica(id: number) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    const idNumero = Number(id)
    const nuevaLista = listaPoliticas.findIndex(p => p.id === idNumero);

    if (nuevaLista === -1) {
      throw new NotFoundException(`No se encontró la política con ID ${idNumero}`);
    }

    listaPoliticas.splice(nuevaLista, 1);

    this.escribirArchivoDePoliticas(listaPoliticas);
    return { mensaje: `Política con ID ${id} eliminada correctamente.` };
  }


  //Validar políticas de estación
  async validarPoliticasEstacion() {
    const politicasDesarrollo = this.leerArchivoDePoliticas();
    const resultados = [];

    for (const politica of politicasDesarrollo) {
      const resultado = await this.estacionRepo
        .createQueryBuilder('ecd')
        .select([
          'e.est_nombre AS Estacion',
          'up.usr_usuario AS Cajero',
          'ce.descripcion AS Coleccion_Estacion',
          'cde.descripcion AS Parametro_Estacion',
          'ecd.variableV AS Varchar_Valor_Estacion_BD',
          ':Valor_Desarrollo AS Varchar_Valor_Estacion_Desarrollo',
          `CASE 
              WHEN ecd.variableV = :Valor_Desarrollo THEN 'coinciden'
              ELSE '--> NO COINCIDEN <--'
           END AS Varchar_Validacion_Coincidencia`,
        ])
        .innerJoin(ColeccionDeDatosEstacion, 'cde', 'cde.ID_ColeccionDeDatosEstacion = ecd.ID_ColeccionDeDatosEstacion')
        .innerJoin(ColeccionEstacion, 'ce', 'ce.ID_ColeccionEstacion = ecd.ID_ColeccionEstacion')
        .innerJoin(Estacion, 'e', 'e.IDEstacion = ecd.IDEstacion')
        .innerJoin(ControlEstacion, 'ces', 'ces.IDEstacion = e.IDEstacion')
        .innerJoin(UsersPos, 'up', 'up.IDUsersPos = ces.IDUsersPos')
        .innerJoin(Status, 's', 'ces.IDStatus = s.IDStatus')
        .where('ce.descripcion = :Coleccion_Estacion', { Coleccion_Estacion: politica.Coleccion_Estacion })
        .andWhere('cde.descripcion = :Parametro_Estacion', { Parametro_Estacion: politica.Parametro_Estacion })
        .andWhere('e.est_nombre = :Estacion', { Estacion: politica.Estacion })
        .andWhere('s.std_descripcion = :status', { status: 'Activo' })
        .setParameters({ Valor_Desarrollo: politica.Valor_Desarrollo })
        .getRawOne();

      resultados.push(resultado || {
        Estacion: politica.Estacion,
        Cajero: 'Sin datos',
        Coleccion_Estacion: politica.Coleccion_Estacion,
        Parametro_Estacion: politica.Parametro_Estacion,
        Varchar_Valor_Estacion_BD: 'Sin datos',
        Varchar_Valor_Estacion_Desarrollo: politica.Valor_Desarrollo,
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
  async actualizarValorEstacion(
    estacion: string,
    coleccion: string,
    parametro: string,
    nuevoValor: string,
  ) {
    console.log('Buscando la política para actualizar...', { estacion, coleccion, parametro });

    // Buscar el registro que se debe actualizar
    const politica = await this.estacionRepo
      .createQueryBuilder('ecd')
      .select([
        'ecd.ID_ColeccionDeDatosEstacion',
        'ecd.IDEstacion'
      ])
      .innerJoin(ColeccionDeDatosEstacion, 'cde', 'cde.ID_ColeccionDeDatosEstacion = ecd.ID_ColeccionDeDatosEstacion')
      .innerJoin(ColeccionEstacion, 'ce', 'ce.ID_ColeccionEstacion = ecd.ID_ColeccionEstacion')
      .innerJoin(Estacion, 'e', 'e.IDEstacion = ecd.IDEstacion')
      .where('e.est_nombre = :estacion', { estacion })
      .andWhere('ce.Descripcion = :coleccion', { coleccion })
      .andWhere('cde.Descripcion = :parametro', { parametro })
      .getRawOne();

    if (!politica) {
      throw new NotFoundException(`No se encontró la política para la estación '${estacion}', colección '${coleccion}', parámetro '${parametro}'`);
    }

    console.log('ID encontrado para actualizar:', politica.ID_EstacionColeccionDeDatos);

    
    // Actualizar el valor de `variableV`
    await this.estacionRepo
      .createQueryBuilder()
      .update(EstacionColeccionDeDatos)
      .set({ variableV: nuevoValor })
      .where('ID_ColeccionDeDatosEstacion = :id', { id: politica.ID_ColeccionDeDatosEstacion })
      .andWhere('IDEstacion = :idEstacion', { idEstacion: politica.IDEstacion })
      .execute();

    console.log('Valor actualizado correctamente en la base de datos.');

    return { mensaje: 'Política actualizada correctamente', nuevaVariableV: nuevoValor };
  }
}
