import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	ListObjectVersionsCommand,
	PutBucketVersioningCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { Logger } from '../common/utils/logger'
import * as dotenv from 'dotenv'
import { extname } from 'path'
import { randomBytes } from 'crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

dotenv.config()

export class StorageService {
	private readonly logger = Logger.child({ label: StorageService.name })

	private readonly client: S3Client
	private readonly bucket: string

	public constructor() {
		this.client = new S3Client({
			endpoint: process.env['S3_ENDPOINT'],
			credentials: {
				accessKeyId: process.env['S3_ACCESS_KEY_ID']!,
				secretAccessKey: process.env['S3_SECRET_ACCESS_KEY']!,
			},
			region: process.env['S3_REGION'],
		})

		this.bucket = process.env['S3_BUCKET_NAME']!
	}

	public async getAll() {
		const command = new ListObjectsV2Command({
			Bucket: this.bucket,
		})

		try {
			return await this.client.send(command)
		} catch (error) {
			this.logger.error('Failed to retrieve file list from S3', error)
			throw error
		}
	}

	public async upload(file: Express.Multer.File) {
		const extension = extname(file.originalname)
		const fileName = randomBytes(16).toString('hex') + extension

		const metadata = {
			originalFilename: file.originalname,
			userId: '123456',
		}

		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: fileName,
			Body: file.buffer,
			ContentType: file.mimetype,
			Metadata: metadata,
		})

		try {
			await this.client.send(command)

			// const getObjectCommand = new GetObjectCommand({
			// 	Bucket: this.bucket,
			// 	Key: fileName,
			// })

			// const url = await getSignedUrl(this.client, getObjectCommand, {
			// 	expiresIn: 50,
			// })

			return { fileName }
		} catch (error) {
			this.logger.error('Failed to uploading file to S3', error)
			throw error
		}
	}

	public async download(key: string) {
		const command = new GetObjectCommand({
			Bucket: this.bucket,
			Key: key,
		})

		try {
			return await this.client.send(command)
		} catch (error) {
			this.logger.error('Failed to download file from S3', error)
			throw error
		}
	}

	public async delete(key: string) {
		const command = new DeleteObjectCommand({
			Bucket: this.bucket,
			Key: key,
		})

		try {
			return await this.client.send(command)
		} catch (error) {
			this.logger.error('Failed to delete file from S3', error)
			throw error
		}
	}

	public async enableVersioning() {
		const command = new PutBucketVersioningCommand({
			Bucket: this.bucket,
			VersioningConfiguration: {
				Status: 'Enabled',
			},
		})

		try {
			await this.client.send(command)
		} catch (error) {
			this.logger.error('Failed to enable versioing on bucket', error)
			throw error
		}
	}

	public async listVersions(key: string) {
		const command = new ListObjectVersionsCommand({
			Bucket: this.bucket,
			Prefix: key,
		})

		try {
			const response = await this.client.send(command)

			return response.Versions?.filter((v) => v.Key === key)
		} catch (error) {
			this.logger.error('Failed to list object versions', error)
			throw error
		}
	}

	public async restoreVersion(key: string, versionId: string) {
		const command = new CopyObjectCommand({
			Bucket: this.bucket,
			Key: key,
			CopySource: `${this.bucket}/${key}?versionId=${versionId}`,
		})

		try {
			await this.client.send(command)
		} catch (error) {
			this.logger.error('Failed to restore object version', error)
			throw error
		}
	}
}
