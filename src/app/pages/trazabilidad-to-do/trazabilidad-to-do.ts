import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trazabilidad-to-do',
  imports: [FormsModule],
  templateUrl: './trazabilidad-to-do.html',
  styleUrl: './trazabilidad-to-do.css'
})
export class TrazabilidadToDo {

  // Toda la lista del To-Do que pega el usuario
  trazabilidadCompleta: string = '';

  // Nombre del proyecto que quiere buscar
  nombreProyecto: string = '';

  // Resultado de la búsqueda
  resultado: string = '';

  // Mensajes de error o información
  mensaje: string = '';


  buscarProyecto(): void {

    // Limpiar resultados anteriores
    this.resultado = '';
    this.mensaje = '';

    // Obtener los valores
    const texto = this.trazabilidadCompleta.trim();
    const proyecto = this.nombreProyecto.trim();

    // Validar que exista la trazabilidad
    if (!texto) {
      this.mensaje = '⚠️ No has pegado ninguna trazabilidad.';
      return;
    }

    // Validar que exista el nombre del proyecto
    if (!proyecto) {
      this.mensaje = '⚠️ No has escrito el nombre del proyecto.';
      return;
    }

    // Separar toda la trazabilidad por líneas
    const lineas = texto.split(/\r?\n/);

    // Buscar dónde comienza el proyecto
    const indiceProyecto = lineas.findIndex(linea =>
      linea.toLowerCase().includes(proyecto.toLowerCase())
    );

    // Si no encuentra el proyecto
    if (indiceProyecto === -1) {
      this.mensaje = `❌ No se encontró el proyecto: ${proyecto}`;
      return;
    }

    /*
     * Buscar dónde comienza el siguiente proyecto.
     *
     * Los encabezados de los proyectos están al margen izquierdo,
     * mientras que las actividades tienen espacios al comienzo.
     *
     * Ejemplo:
     *
     * GD-INIRCO-1028519284
     *         ✅ Actividad
     *         ✅ Actividad
     *         ⬜ Actividad
     *
     * ⬜ MAYORCA 2-23619231
     *         ✅ Actividad
     */

    let indiceSiguienteProyecto = lineas.length;

    for (let i = indiceProyecto + 1; i < lineas.length; i++) {

      const lineaOriginal = lineas[i];

      // Verificamos si la línea tiene indentación
      const tieneIndentacion = /^\s+/.test(lineaOriginal);

      // Quitamos espacios para analizar el contenido
      const linea = lineaOriginal.trim();

      /*
       * Un nuevo proyecto debe estar al margen izquierdo.
       *
       * Puede comenzar directamente con el nombre
       * o con ⬜ / ✅.
       */
      const esEncabezadoProyecto =
        !tieneIndentacion &&
        linea.length > 0 &&
        (
          linea.startsWith('⬜') ||
          linea.startsWith('✅') ||
          !linea.startsWith(' ')
        );

      if (esEncabezadoProyecto) {
        indiceSiguienteProyecto = i;
        break;
      }
    }

    // Obtener únicamente las líneas del proyecto seleccionado
    const proyectoEncontrado = lineas
      .slice(indiceProyecto, indiceSiguienteProyecto)
      .join('\n')
      .trim();

    // Mostrar resultado
    this.resultado = proyectoEncontrado;

  }

}