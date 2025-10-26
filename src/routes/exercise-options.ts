import express, { Request, Response, NextFunction } from 'express';
import { exerciseOptionsController } from '../controllers/exercise-options';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/api';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken as (req: Request, res: Response, next: NextFunction) => void);

// Rutas para opciones de ejercicio
router.post('/', exerciseOptionsController.createExerciseOption.bind(exerciseOptionsController));
router.get('/exercise/:ejercicioId', exerciseOptionsController.getExerciseOptions.bind(exerciseOptionsController));
router.put('/:id', exerciseOptionsController.updateExerciseOption.bind(exerciseOptionsController));
router.delete('/:id', exerciseOptionsController.deleteExerciseOption.bind(exerciseOptionsController));

export default router;
