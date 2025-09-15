import {Router} from 'express'
import {  AddPatient, DeletePatient, GetPatient, GetPatientList, UpdatePatient } from '../controllers/patient.controller.js'

const router = Router()

router.get('/get-list', GetPatientList)
router.get('/get-by-id/:id', GetPatient)

router.post('/add', AddPatient)

router.put("/update/:id", UpdatePatient);
router.delete("/delete/:id", DeletePatient);

export default router