import express, { type Application } from 'express'
import { Logger } from './common/utils/logger'
import storageRouter from './routes/storage'

export class Server {
	private readonly logger = Logger.child({ label: Server.name })

	private readonly app: Application

	public constructor() {
		this.app = express()
		this.configure()
	}

	private async configure() {
		this.app.use(express.json())

		this.app.use('/storage', storageRouter)
	}

	public async start() {
		const port = 4000

		this.app.listen(port, () => {
			this.logger.info(`Server running on port ${port}`)
		})
	}
}
