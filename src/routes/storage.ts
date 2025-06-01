import { Router } from 'express'
import multer from 'multer'
import { StorageController } from '../controllers/storage'

const router = Router()
const upload = multer()

const controller = new StorageController()

router.get('/', async (req, res) => {
	await controller.getAll(req, res)
})

router.post('/', upload.single('file'), async (req, res) => {
	await controller.upload(req, res)
})

router.get('/version', async (req, res) => {
	await controller.listVersions(req, res)
})

router.get('/:key', async (req, res) => {
	await controller.download(req, res)
})

router.delete('/', async (req, res) => {
	await controller.delete(req, res)
})

router.put('/version', async (req, res) => {
	await controller.enableVersioning(req, res)
})

router.post('/version', async (req, res) => {
	await controller.restoreVersion(req, res)
})

export default router
