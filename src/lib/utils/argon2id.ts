import { hash, verify, type Options } from '@node-rs/argon2';
import type { TypedArray } from '@/lib/types';

export interface PasswordHashingAlgorithm {
	hash(password: string): Promise<string>;
	verify(hash: string, password: string): Promise<boolean>;
}

// Using the official enum values
const Algorithm = {
	Argon2id: 2
} as const;

const Version = {
	V0x13: 1
} as const;

export class Argon2id implements PasswordHashingAlgorithm {
	constructor(options?: {
		memorySize?: number;
		iterations?: number;
		tagLength?: number;
		parallelism?: number;
		secret?: ArrayBuffer | TypedArray;
	}) {
		this.memorySize = options?.memorySize ?? 19456;
		this.iterations = options?.iterations ?? 2;
		this.tagLength = options?.tagLength ?? 32;
		this.parallelism = options?.parallelism ?? 1;
		this.secret = options?.secret ?? null;
	}

	private readonly memorySize: number;
	private readonly iterations: number;
	private readonly tagLength: number;
	private readonly parallelism: number;
	private readonly secret: ArrayBuffer | TypedArray | null;

	private getOptions(): Options {
		const options: Options = {
			memoryCost: this.memorySize,
			timeCost: this.iterations,
			outputLen: this.tagLength,
			parallelism: this.parallelism,
			algorithm: Algorithm.Argon2id,
			version: Version.V0x13
		};

		if (this.secret) {
			const secretBuffer =
				this.secret instanceof ArrayBuffer
					? new Uint8Array(this.secret)
					: new Uint8Array(this.secret.buffer);
			options.secret = secretBuffer;
		}

		return options;
	}

	public async hash(password: string): Promise<string> {
		return await hash(password.normalize('NFKC'), this.getOptions());
	}

	public async verify(hash: string, password: string): Promise<boolean> {
		if (!hash || !password) {
			return false;
		}
		return await verify(hash, password.normalize('NFKC'), this.getOptions());
	}
}
