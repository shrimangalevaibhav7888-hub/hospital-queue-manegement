import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';

const router = Router();

router.get('/', DoctorController.listAll);
router.get('/departments', DoctorController.listDepartments);
router.get('/:id', DoctorController.getById);

export default router;
