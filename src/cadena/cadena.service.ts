import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CadenaColeccionDeDatos } from './entities/cadena-coleccion-de-datos.entity';
import { ColeccionDeDatosCadena } from './entities/coleccion-de-datos-cadena.entity';
import { ColeccionCadena } from './entities/coleccion-cadena.entity';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class CadenaService {
  private filePath = join(__dirname, '..', '..', 'assets', 'politicas_cadena.json');

  constructor(
    @InjectRepository(CadenaColeccionDeDatos)
    private readonly cadenaRepo: Repository<CadenaColeccionDeDatos>,
    @InjectRepository(ColeccionDeDatosCadena)
    private readonly coleccionDeDatosRepo: Repository<ColeccionDeDatosCadena>,
    @InjectRepository(ColeccionCadena)
    private readonly coleccionCadenaRepo: Repository<ColeccionCadena>,
  ) { }


  //Leer el JSON 
  private leerArchivoDePoliticas(): any[] {
    if (!existsSync(this.filePath)) return [];
    try {
      const fileContent = readFileSync(this.filePath, 'utf8');
      const data = JSON.parse(fileContent);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al leer el JSON:', error.message);
      return [];
    }
  }


  //Escribir correctamente los datos en formato array
  private escribirArchivoDePoliticas(politicas: any[]) {
    try {
      writeFileSync(this.filePath, JSON.stringify(politicas, null, 2), 'utf8');
      console.log(' Archivo JSON actualizado correctamente.');
    } catch (error) {
      console.error('Error al escribir el JSON:', error.message);
    }
  }


  //Obtener TODAS las políticas correctamente
  obtenerTodasLasPoliticas() {
    return this.leerArchivoDePoliticas();
  }

  //Insertar una o varias políticas
  insertarPolitica(politicas: any | any[]) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    if (!Array.isArray(politicas)) {
      politicas = [politicas];
    }


    //Encontrar el ID más alto actual
    let maxId = listaPoliticas.length > 0 ? Math.max(...listaPoliticas.map(p => p.id)) : 0;

    const nuevasPoliticas = politicas.map(politica => ({
      id: ++maxId,
      ...politica,
    }));

    listaPoliticas = [...listaPoliticas, ...nuevasPoliticas];

    this.escribirArchivoDePoliticas(listaPoliticas);

    return { mensaje: 'Políticas agregadas correctamente', data: nuevasPoliticas };
  }


  // Editar una política
  editarPolitica(id: number, politicaActualizada: { Coleccion_Cadena: string; Parametro_Cadena: string; Valor_Desarrollo: string }) {
    let listaPoliticas = this.leerArchivoDePoliticas();
    const index = listaPoliticas.findIndex(p => p.id === id);

    if (index === -1) {
      throw new NotFoundException(` No se encontró la política con ID ${id}`);
    }

    listaPoliticas[index] = { id, ...politicaActualizada };

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
    return { mensaje: `Política con Colección: ${id} y Parámetro: ${id} eliminada correctamente.` };
  }


  // Validar las políticas contra la base de datos
  async validarPoliticasCadena() {
    const politicasArchivo = this.leerArchivoDePoliticas();
    const resultados = [];

    for (const politica of politicasArchivo) {
      const resultado = await this.cadenaRepo
        .createQueryBuilder('ccd')
        .select([
          'cc.Descripcion AS Coleccion_Cadena',
          'cdc.Descripcion AS Parametro_Cadena',
          'ccd.variableV AS Varchar_Valor_Cadena_BD',
          ':Valor_Desarrollo AS Varchar_Valor_Cadena_Desarrollo',
          `CASE 
            WHEN ccd.variableV = :Valor_Desarrollo THEN 'coinciden'
            ELSE '--> NO COINCIDEN <--'
           END AS Varchar_Validacion_Coincidencia`,
        ])
        .innerJoin(ColeccionDeDatosCadena, 'cdc', 'cdc.ID_ColeccionDeDatosCadena = ccd.ID_ColeccionDeDatosCadena')
        .innerJoin(ColeccionCadena, 'cc', 'cc.ID_ColeccionCadena = ccd.ID_ColeccionCadena')
        .where('cc.Descripcion = :Coleccion_Cadena', { Coleccion_Cadena: politica.Coleccion_Cadena })
        .andWhere('cdc.Descripcion = :Parametro_Cadena', { Parametro_Cadena: politica.Parametro_Cadena })
        .setParameters({ Valor_Desarrollo: politica.Valor_Desarrollo })
        .getRawOne();

      resultados.push(resultado || {
        Coleccion_Cadena: politica.Coleccion_Cadena,
        Parametro_Cadena: politica.Parametro_Cadena,
        Varchar_Valor_Cadena_BD: 'Sin datos',
        Varchar_Valor_Cadena_Desarrollo: politica.Valor_Desarrollo,
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


  //Actualizar Varchar_Valor_Cadena_BD en la base de datos cuando no coincida
  async actualizarValorEnBaseDeDatos(Coleccion_Cadena: string, Parametro_Cadena: string, Nuevo_Valor: string) {

    // Buscar la política en la base de datos
    const politica = await this.cadenaRepo
      .createQueryBuilder('ccd')
      .select(['ccd.ID_ColeccionDeDatosCadena', 'ccd.variableV'])
      .innerJoin(ColeccionDeDatosCadena, 'cdc', 'cdc.ID_ColeccionDeDatosCadena = ccd.ID_ColeccionDeDatosCadena')
      .innerJoin(ColeccionCadena, 'cc', 'cc.ID_ColeccionCadena = ccd.ID_ColeccionCadena')
      .where('cc.Descripcion = :Coleccion_Cadena', { Coleccion_Cadena })
      .andWhere('cdc.Descripcion = :Parametro_Cadena', { Parametro_Cadena })
      .getRawOne();

    console.log('🔎 Resultado de la búsqueda:', politica);

    if (!politica) {
      throw new NotFoundException(`No se encontró la política con Colección: ${Coleccion_Cadena} y Parámetro: ${Parametro_Cadena}`);
    }

    console.log('ID encontrado:', politica.ID_ColeccionDeDatosCadena);

    // Actualizar el valor en la base de datos
    await this.cadenaRepo
      .createQueryBuilder()
      .update(CadenaColeccionDeDatos)
      .set({ variableV: Nuevo_Valor })
      .where('ID_ColeccionDeDatosCadena = :id', { id: politica.ID_ColeccionDeDatosCadena })
      .execute();

    console.log('Valor actualizado correctamente en la base de datos.');

    return { mensaje: 'Valor actualizado correctamente en la base de datos. Ahora coinciden.' };
  }






}


