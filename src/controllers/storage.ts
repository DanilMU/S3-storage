import type { Request, Response } from 'express'
import { StorageService } from '../services/storage'

export class StorageController {
	private readonly storageService = new StorageService()

	public async getAll(req: Request, res: Response) {
		try {
			const objects = await this.storageService.getAll()

			res.status(200).json(objects)
		} catch (error) {
			res.status(500).json({ message: 'Failed to retrieve file list' })
		}
	}

	public async upload(req: Request, res: Response) {
		try {
			const file = req.file

			if (!file)
				return res.status(400).json({ message: 'No file provided' })

			const uploadedFile = await this.storageService.upload(file)

			res.status(200).json(uploadedFile)
		} catch (error) {
			res.status(500).json({ message: 'Failed to upload file' })
		}
	}

	public async download(req: Request, res: Response) {
		try {
			const { key } = req.params

			const object = await this.storageService.download(key)

			console.log(object)

			res.setHeader(
				'Content-Type',
				object.ContentType ?? 'application/octet-stream'
			)
			res.setHeader(
				'Content-Length',
				object.ContentLength?.toString() ?? ''
			)
			res.setHeader('Content-Disposition', `attachment; filename=${key}`)
			;(object.Body as NodeJS.ReadableStream).pipe(res)
		} catch (error) {
			res.status(500).json({ message: 'Failed to download file' })
		}
	}

	public async delete(req: Request, res: Response) {
		try {
			const { key } = req.body

			await this.storageService.delete(key)

			res.status(200).json({ message: 'File deleted successfully' })
		} catch (error) {
			res.status(500).json({ message: 'Failed to delete file' })
		}
	}

	public async enableVersioning(req: Request, res: Response) {
		try {
			await this.storageService.enableVersioning()

			res.status(200).json({ message: 'Versioning enabled successfully' })
		} catch (error) {
			res.status(500).json({ message: 'Failed to enable versioing' })
		}
	}

	public async listVersions(req: Request, res: Response) {
		try {
			const { key } = req.body

			if (!key)
				return res.status(400).json({ message: 'Key is required' })

			const versions = await this.storageService.listVersions(key)

			res.status(200).json(versions)
		} catch (error) {
			res.status(500).json({ message: 'Failed to list object versions' })
		}
	}

	public async restoreVersion(req: Request, res: Response) {
		try {
			const { key, versionId } = req.body

			if (!key || !versionId)
				return res
					.status(400)
					.json({ message: 'Key and versionId are required' })

			await this.storageService.restoreVersion(key, versionId)

			res.status(200).json({ message: 'Version restored successfully' })
		} catch (error) {
			res.status(500).json({ message: 'Failed to restore version' })
		}
	}
}
