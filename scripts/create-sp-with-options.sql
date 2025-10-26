-- Ejecutar el stored procedure en la base de datos
-- Ejecuta este script en SQL Server Management Studio

USE AprendeCsharp
GO

-- ============================================
-- SP_Ejercicio_ObtenerPorLeccionConOpciones
-- Obtener ejercicios de una lección con sus opciones
-- ============================================
CREATE OR ALTER PROCEDURE SP_Ejercicio_ObtenerPorLeccionConOpciones
    @LeccionId INT,
    @UsuarioId INT = NULL,
    @IncluirSolucion BIT = 0,
    @SoloCompletados BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Primer recordset: Ejercicios
    SELECT 
        e.EjercicioId,
        e.LeccionId,
        e.TipoEjercicioId,
        te.NombreTipo AS TipoEjercicio,
        te.Descripcion AS TipoDescripcion,
        e.Titulo,
        e.Instrucciones,
        CASE WHEN @IncluirSolucion = 1 THEN e.CodigoInicial ELSE NULL END AS CodigoInicial,
        CASE WHEN @IncluirSolucion = 1 THEN e.Solucion ELSE NULL END AS Solucion,
        CASE WHEN @IncluirSolucion = 1 THEN e.CasosPrueba ELSE NULL END AS CasosPrueba,
        CASE WHEN @IncluirSolucion = 1 THEN e.Pistas ELSE NULL END AS Pistas,
        e.RecompensaXP,
        e.OrdenIndice,
        e.NivelDificultad,
        e.FechaCreacion,
        -- Estadísticas del usuario si se especifica
        CASE WHEN @UsuarioId IS NOT NULL THEN 
            COUNT(DISTINCT ie.IntentoId)
        ELSE 0 END AS TotalIntentos,
        CASE WHEN @UsuarioId IS NOT NULL THEN 
            MAX(CASE WHEN ie.EsCorrecto = 1 THEN 1 ELSE 0 END)
        ELSE 0 END AS EstaCompletado,
        CASE WHEN @UsuarioId IS NOT NULL THEN 
            MAX(ie.XPGanado)
        ELSE 0 END AS XPGanado,
        CASE WHEN @UsuarioId IS NOT NULL THEN 
            MAX(ie.NumeroIntento)
        ELSE 0 END AS UltimoIntento,
        -- Mejor intento del usuario
        CASE WHEN @UsuarioId IS NOT NULL THEN 
            MAX(CASE WHEN ie.EsCorrecto = 1 THEN ie.TiempoEjecucion END)
        ELSE NULL END AS MejorTiempo
    FROM Ejercicios e
    INNER JOIN TiposEjercicio te ON e.TipoEjercicioId = te.TipoEjercicioId
    LEFT JOIN IntentosEjercicio ie ON e.EjercicioId = ie.EjercicioId 
        AND (@UsuarioId IS NULL OR ie.UsuarioId = @UsuarioId)
    WHERE e.LeccionId = @LeccionId
        AND (@SoloCompletados = 0 OR EXISTS (
            SELECT 1 FROM IntentosEjercicio ie2 
            WHERE ie2.EjercicioId = e.EjercicioId 
                AND ie2.UsuarioId = @UsuarioId 
                AND ie2.EsCorrecto = 1
        ))
    GROUP BY 
        e.EjercicioId, e.LeccionId, e.TipoEjercicioId, te.NombreTipo, te.Descripcion,
        e.Titulo, e.Instrucciones, e.CodigoInicial, e.Solucion, e.CasosPrueba, 
        e.Pistas, e.RecompensaXP, e.OrdenIndice, e.NivelDificultad, e.FechaCreacion
    ORDER BY e.OrdenIndice ASC;
    
    -- Segundo recordset: Opciones de ejercicios
    SELECT 
        oe.OpcionId,
        oe.EjercicioId,
        oe.TextoOpcion,
        CASE WHEN @IncluirSolucion = 1 THEN oe.EsCorrecta ELSE NULL END AS EsCorrecta,
        CASE WHEN @IncluirSolucion = 1 THEN oe.Explicacion ELSE NULL END AS Explicacion,
        oe.OrdenIndice
    FROM OpcionesEjercicio oe
    INNER JOIN Ejercicios e ON oe.EjercicioId = e.EjercicioId
    WHERE e.LeccionId = @LeccionId
    ORDER BY oe.EjercicioId, oe.OrdenIndice ASC;
END
GO

-- Probar el stored procedure
EXEC SP_Ejercicio_ObtenerPorLeccionConOpciones @LeccionId = 3, @IncluirSolucion = 1
GO
