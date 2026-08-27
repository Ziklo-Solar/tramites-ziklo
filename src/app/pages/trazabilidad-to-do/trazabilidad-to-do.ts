import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx-js-style';

interface Actividad {
  actividad: string;
  fecha: string;
  completada: string;
}

@Component({
  selector: 'app-trazabilidad-to-do',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './trazabilidad-to-do.html',
  styleUrl: './trazabilidad-to-do.css'
})
export class TrazabilidadToDo {

  // ============================================================
  // VARIABLES
  // ============================================================

  trazabilidadCompleta: string = '';

  nombreProyecto: string = '';

  resultado: string = '';

  mensaje: string = '';


  // ============================================================
  // BUSCAR PROYECTO
  // ============================================================

  buscarProyecto(): void {

    this.resultado = '';
    this.mensaje = '';

    const texto = this.trazabilidadCompleta.trim();
    const proyectoBuscado = this.nombreProyecto.trim();


    // ----------------------------------------------------------
    // VALIDACIONES
    // ----------------------------------------------------------

    if (!texto) {
      this.mensaje =
        '⚠️ Debes pegar primero toda la trazabilidad.';
      return;
    }

    if (!proyectoBuscado) {
      this.mensaje =
        '⚠️ Debes escribir el nombre del proyecto.';
      return;
    }


    // ----------------------------------------------------------
    // SEPARAR TRAZABILIDAD POR LÍNEAS
    // ----------------------------------------------------------

    const lineas = texto
      .split(/\r?\n/)
      .map(linea => linea.trim())
      .filter(linea => linea.length > 0);


    // ----------------------------------------------------------
    // BUSCAR EL PROYECTO
    // ----------------------------------------------------------

    const indiceProyecto = lineas.findIndex(linea =>
      linea
        .toLowerCase()
        .includes(proyectoBuscado.toLowerCase())
    );


    if (indiceProyecto === -1) {

      this.mensaje =
        `❌ No se encontró el proyecto "${proyectoBuscado}".`;

      return;
    }


    // ----------------------------------------------------------
    // BUSCAR EL SIGUIENTE PROYECTO
    // ----------------------------------------------------------

    let indiceSiguienteProyecto = lineas.length;


    for (
      let i = indiceProyecto + 1;
      i < lineas.length;
      i++
    ) {

      const linea = lineas[i];


      /*
       * Un proyecto tiene esta estructura:
       *
       * ⬜ NOMBRE DEL PROYECTO - XXXXX - Vencimiento...
       *
       * Una actividad pendiente también puede comenzar con ⬜,
       * por eso necesitamos la palabra "Vencimiento".
       */

      const esProyecto =
        /^⬜\s+.+Vencimiento/i.test(linea);


      if (esProyecto) {

        indiceSiguienteProyecto = i;

        break;
      }
    }


    // ----------------------------------------------------------
    // EXTRAER EL PROYECTO
    // ----------------------------------------------------------

    const lineasProyecto = lineas.slice(
      indiceProyecto,
      indiceSiguienteProyecto
    );


    // ----------------------------------------------------------
    // UNIR LÍNEAS QUE PERTENECEN A UNA MISMA ACTIVIDAD
    // ----------------------------------------------------------

    const lineasUnificadas =
      this.unirLineasContinuacion(lineasProyecto);


    // ----------------------------------------------------------
    // MOSTRAR RESULTADO
    // ----------------------------------------------------------

    this.resultado =
      lineasUnificadas.join('\n');


    this.mensaje =
      `✅ Proyecto encontrado: ${proyectoBuscado}`;
  }


  // ============================================================
  // UNIR LÍNEAS DE CONTINUACIÓN
  // ============================================================

  private unirLineasContinuacion(
    lineas: string[]
  ): string[] {

    const resultado: string[] = [];


    for (const lineaOriginal of lineas) {

      const linea = lineaOriginal.trim();


      if (!linea) {
        continue;
      }


      /*
       * Una nueva actividad comienza con alguno de estos símbolos:
       *
       * ✅ Actividad completada
       * ⬜ Actividad pendiente
       * ☑ Actividad completada
       * ✔ Actividad completada
       */

      const esNuevaActividad =
        /^(✅|⬜|☑|✔)\s*/.test(linea);


      if (esNuevaActividad) {

        resultado.push(linea);

      } else {

        /*
         * Si no comienza con uno de los símbolos anteriores,
         * pertenece a la actividad inmediatamente anterior.
         */

        if (resultado.length > 0) {

          resultado[resultado.length - 1] +=
            ' ' + linea;

        } else {

          resultado.push(linea);
        }
      }
    }


    return resultado;
  }


  // ============================================================
  // GENERAR EXCEL
  // ============================================================

  generarExcel(): void {

    this.mensaje = '';


    // ----------------------------------------------------------
    // VALIDAR RESULTADO
    // ----------------------------------------------------------

    if (!this.resultado) {

      this.mensaje =
        '⚠️ Primero debes generar la trazabilidad.';

      return;
    }


    // ----------------------------------------------------------
    // SEPARAR RESULTADO
    // ----------------------------------------------------------

    const lineas = this.resultado
      .split(/\r?\n/)
      .map(linea => linea.trim())
      .filter(linea => linea.length > 0);


    /*
     * La primera línea corresponde al nombre del proyecto.
     */

    const lineasActividades =
      lineas.slice(1);


    // ----------------------------------------------------------
    // UNIR LÍNEAS PARTIDAS
    // ----------------------------------------------------------

    const actividadesUnificadas =
      this.unirLineasContinuacion(
        lineasActividades
      );


    const actividades: Actividad[] = [];


    // ----------------------------------------------------------
    // PROCESAR ACTIVIDADES
    // ----------------------------------------------------------

    for (
      const lineaOriginal of actividadesUnificadas
    ) {

      let linea =
        lineaOriginal.trim();


      if (!linea) {
        continue;
      }


      // --------------------------------------------------------
      // NO PROCESAR OTRO ENCABEZADO DE PROYECTO
      // --------------------------------------------------------

      if (
        /^⬜\s+.+Vencimiento/i.test(linea)
      ) {
        continue;
      }


      // --------------------------------------------------------
      // DETERMINAR ESTADO
      // --------------------------------------------------------

      let completada = 'No';


      if (
        linea.startsWith('✅') ||
        linea.startsWith('☑') ||
        linea.startsWith('✔')
      ) {

        completada = 'Sí';
      }


      // --------------------------------------------------------
      // QUITAR SÍMBOLO DE ESTADO
      // --------------------------------------------------------

      let actividad = linea
        .replace(/^✅\s*/, '')
        .replace(/^☑\s*/, '')
        .replace(/^✔\s*/, '')
        .replace(/^⬜\s*/, '')
        .trim();


      if (!actividad) {
        continue;
      }


      // --------------------------------------------------------
      // EXTRAER FECHA
      // --------------------------------------------------------

      const fecha =
        this.extraerFecha(actividad);


      // --------------------------------------------------------
      // QUITAR FECHA DEL TEXTO
      // --------------------------------------------------------

      if (fecha) {

        actividad =
          this.quitarFecha(actividad);
      }


      // --------------------------------------------------------
      // GUARDAR ACTIVIDAD
      // --------------------------------------------------------

      actividades.push({

        actividad:
          actividad.trim(),

        fecha:
          fecha,

        completada:
          completada
      });
    }


    // ----------------------------------------------------------
    // VALIDAR ACTIVIDADES
    // ----------------------------------------------------------

    if (actividades.length === 0) {

      this.mensaje =
        '⚠️ No se encontraron actividades para generar el Excel.';

      return;
    }


    // ==========================================================
    // DATOS DEL EXCEL
    // ==========================================================

    const datosExcel =
      actividades.map(item => ({

        Actividad:
          item.actividad,

        Fecha:
          item.fecha,

        Completada:
          item.completada

      }));


    // ==========================================================
    // CREAR HOJA
    // ==========================================================

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(
        datosExcel
      );


    // ==========================================================
    // ÚLTIMA FILA REAL CON DATOS
    // ==========================================================

    const ultimaFila =
      actividades.length + 1;


    // ==========================================================
    // ESTILO DEL ENCABEZADO
    // ==========================================================

    const estiloEncabezado = {

      font: {
        bold: true
      },

      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
      },

      border: {

        top: {
          style: 'thin'
        },

        bottom: {
          style: 'thin'
        },

        left: {
          style: 'thin'
        },

        right: {
          style: 'thin'
        }

      }

    };


    // Aplicar encabezado
    worksheet['A1'].s =
      estiloEncabezado;

    worksheet['B1'].s =
      estiloEncabezado;

    worksheet['C1'].s =
      estiloEncabezado;


    // ============================================================
    // ESTILO DE LAS CELDAS
    // ============================================================

    const estiloCelda = {

      border: {

        top: {
          style: 'thin'
        },

        bottom: {
          style: 'thin'
        },

        left: {
          style: 'thin'
        },

        right: {
          style: 'thin'
        }

      },

      alignment: {

        vertical: 'center',

        wrapText: true

      }

    };


    // ============================================================
    // APLICAR BORDES SOLO A LAS FILAS CON DATOS
    // ============================================================

    for (
      let fila = 2;
      fila <= ultimaFila;
      fila++
    ) {


      // --------------------------------------------------------
      // ACTIVIDAD
      // --------------------------------------------------------

      const celdaActividad =
        `A${fila}`;


      if (worksheet[celdaActividad]) {

        worksheet[celdaActividad].s = {

          ...estiloCelda,

          alignment: {

            vertical: 'center',

            horizontal: 'left',

            wrapText: true

          }

        };

      }


      // --------------------------------------------------------
      // FECHA
      // --------------------------------------------------------

      const celdaFecha =
        `B${fila}`;


      if (worksheet[celdaFecha]) {

        worksheet[celdaFecha].s = {

          ...estiloCelda,

          alignment: {

            vertical: 'center',

            horizontal: 'center',

            wrapText: true

          }

        };

      }


      // --------------------------------------------------------
      // COMPLETADA
      // --------------------------------------------------------

      const celdaCompletada =
        `C${fila}`;


      if (worksheet[celdaCompletada]) {

        worksheet[celdaCompletada].s = {

          ...estiloCelda,

          alignment: {

            vertical: 'center',

            horizontal: 'center',

            wrapText: true

          }

        };

      }

    }


    // ============================================================
    // ALTURA DEL ENCABEZADO
    // ============================================================

    worksheet['!rows'] = [

      {
        hpt: 25
      }

    ];


    // ============================================================
    // ANCHO DE COLUMNAS
    // ============================================================

    worksheet['!cols'] = [

      {
        wch: 100
      },

      {
        wch: 18
      },

      {
        wch: 15
      }

    ];


    // ============================================================
    // AUTOFILTRO
    // ============================================================

    worksheet['!autofilter'] = {

      ref:
        `A1:C${ultimaFila}`

    };


    // ============================================================
    // CONGELAR PRIMERA FILA
    // ============================================================

    worksheet['!freeze'] = {

      xSplit: 0,

      ySplit: 1

    };


    // ============================================================
    // CREAR LIBRO
    // ============================================================

    const workbook: XLSX.WorkBook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Trazabilidad'

    );


    // ============================================================
    // NOMBRE DEL ARCHIVO
    // ============================================================

    const nombreProyecto =
      this.limpiarNombreArchivo(
        this.nombreProyecto
      );


    const nombreArchivo =
      `TRAZBILIDAD  ${nombreProyecto}.xlsx`;


    // ============================================================
    // DESCARGAR
    // ============================================================

    XLSX.writeFile(

      workbook,

      nombreArchivo

    );


    this.mensaje =
      '✅ Excel generado correctamente.';
  }


  // ============================================================
  // EXTRAER FECHA
  // ============================================================

  private extraerFecha(
    texto: string
  ): string {

    const regex =
      /\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](\d{2}|\d{4})\b/g;


    const coincidencias =
      texto.match(regex);


    if (!coincidencias) {

      return '';
    }


    return coincidencias.join(' / ');
  }


  // ============================================================
  // QUITAR FECHA
  // ============================================================

  private quitarFecha(
    texto: string
  ): string {

    const regex =
      /\s*\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](\d{2}|\d{4})\b\.?/g;


    return texto
      .replace(regex, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }


  // ============================================================
  // LIMPIAR NOMBRE DEL ARCHIVO
  // ============================================================

  private limpiarNombreArchivo(
    nombre: string
  ): string {

    /*
     * Conservamos espacios, guiones y demás caracteres
     * permitidos por Windows.
     *
     * Solamente eliminamos los caracteres que Windows
     * NO permite en nombres de archivos:
     *
     * < > : " / \ | ? *
     */

    return nombre
      .trim()
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 150);
  }

}